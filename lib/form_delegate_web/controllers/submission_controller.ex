defmodule FormDelegateWeb.SubmissionController do
  use FormDelegateWeb, :controller

  require Logger

  alias FormDelegate.{Submissions, Submissions.Submission}
  alias FormDelegateWeb.Authorizer

  @akismet_api_key System.get_env("AKISMET_API_KEY")

  action_fallback FormDelegateWeb.FallbackController

  def action(conn, _opts) do
    args = [conn, conn.params, conn.assigns[:current_user] || :guest]
    apply(__MODULE__, action_name(conn), args)
  end

  # @TODO: Check that user.confirmed_at is non-null
  # @TODO: Responds with /submissions/:submission_id link alongside 202
  # @TODO: Apply some form of spam filtering before Akismet is used
  # @TODO: Allow user to specify redirect after submission
  def create(conn, params, current_user) do
    grouped_submission_params = transform_params_to_submission_map(params)

    sender_meta_data = %{
      "sender_ip" => remote_addr(conn),
      "sender_referrer" => Plug.Conn.get_req_header(conn, "referer") |> to_string(),
      "sender_user_agent" => Plug.Conn.get_req_header(conn, "user-agent") |> to_string()
    }

    merged_params = Map.merge(grouped_submission_params, sender_meta_data)

    with :ok <- Authorizer.authorize(:create_submission, current_user),
         {:ok, %Submission{} = submission} <- Submissions.create_submission(merged_params) do
      # @TODO: Allow user-specified Akismet API key per form
      case akismet_api().is_spam?(@akismet_api_key, submission) do
        {:ok, false} ->
          Logger.info("FD: No spam detected for #{submission.id}")
          Rihanna.enqueue(FormDelegate.SubmissionQueueJob, [submission])

        {:ok, true} ->
          Logger.info("FD: Spam detected for #{submission.id}")

          Submissions.flag_submission(submission, %{
            flagged_at: DateTime.utc_now(),
            flagged_type:
              Submissions.get_or_create_flagged_type(%{
                type: "spam"
              })
          })

        {:error, error} ->
          Logger.error("FD: Akismet error for #{submission.id}: #{inspect(error)}")
      end

      # Broadcast submission to user's channel after processing spam filters
      broadcast_submission(submission)

      # Send identical accepted response to all requests
      body = Jason.encode!(%{submission: "Accepted"})

      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:accepted, body)
    else
      {:error, %Ecto.Changeset{errors: [form_id: _form_id_error]}} ->
        Logger.debug("FD: Submission create changeset error for form #{params["form_id"]}")
        {:error, :not_found}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:error, changeset}
    end
  end

  def ham(conn, %{"id" => id}, current_user) do
    with %Submission{} = submission <- Submissions.get_submission!(id),
         :ok <- Authorizer.authorize(:update_submission_state, current_user, submission),
         {:ok, submission} <-
           Submissions.flag_submission(submission, %{
             flagged_at: nil,
             flagged_type: nil
           }),
         {:ok, true} <- akismet_api().submit_ham(@akismet_api_key, submission) do
      render(conn, "show.json", submission: submission)
    end
  end

  def index(conn, params, current_user) do
    with :ok <- Authorizer.authorize(:show_user_submissions, current_user) do
      page =
        if params["query"] do
          Submissions.list_search_submissions_of_user(current_user, params)
        else
          Submissions.list_submissions_of_user(current_user, params)
        end

      conn
      |> Scrivener.Headers.paginate(page)
      |> render("index.json", submissions: page.entries)
    end
  end

  def recent_activity(conn, _params, current_user) do
    with :ok <- Authorizer.authorize(:show_recent_submission_activity, current_user) do
      activity = Submissions.get_submission_activity_of_user(current_user)

      render(conn, "recent_activity.json", activity: activity)
    end
  end

  def spam(conn, %{"id" => id}, current_user) do
    with %Submission{} = submission <- Submissions.get_submission!(id),
         :ok <- Authorizer.authorize(:update_submission_state, current_user, submission),
         {:ok, submission} <-
           Submissions.flag_submission(submission, %{
             flagged_at: DateTime.utc_now(),
             flagged_type:
               Submissions.get_or_create_flagged_type(%{
                 type: "spam"
               })
           }),
         {:ok, true} <- akismet_api().submit_spam(@akismet_api_key, submission) do
      render(conn, "show.json", submission: submission)
    end
  end

  def show(conn, %{"id" => id}, current_user) do
    with %Submission{} = submission <- Submissions.get_submission!(id),
         :ok <- Authorizer.authorize(:show_submission, current_user, submission) do
      render(conn, "show.json", submission: submission)
    end
  end

  defp akismet_api do
    Application.get_env(:form_delegate, :akismet_api)
  end

  defp broadcast_submission(%Submission{} = submission) do
    %Submission{form: %{user_id: user_id}} = submission

    FormDelegateWeb.Endpoint.broadcast!(
      "user_form_submissions:" <> to_string(user_id),
      "new_msg",
      Phoenix.View.render(FormDelegateWeb.SubmissionView, "show.json", submission: submission)
    )
  end

  defp contains_upload_struct?({_key, %{__struct__: Plug.Upload}}), do: true

  defp contains_upload_struct?({_key, value}) when is_list(value) do
    Enum.all?(value, &match?(%{__struct__: Plug.Upload}, &1))
  end

  defp contains_upload_struct?(_param), do: false

  defp detect_body_field(params) do
    potential_body_fields = ["submission", "content", "body", "message"]

    Enum.find_value(potential_body_fields, &Map.get(params, &1))
  end

  defp detect_sender_field(params) do
    potential_sender_fields = [
      "name",
      "sender",
      "full_name",
      "fullname",
      "your_name",
      "yourname",
      "email",
      "first_name",
      "last_name",
      "company"
    ]

    Enum.find_value(potential_sender_fields, &Map.get(params, &1))
  end

  defp extract_file_params(params) do
    params
    |> Enum.filter(&contains_upload_struct?/1)
    |> Enum.flat_map(fn
      {field, %Plug.Upload{} = file} ->
        [%{"field_name" => field, "file" => file}]

      {field, files} when is_list(files) ->
        Enum.map(files, &%{"field_name" => field, "file" => &1})
    end)
  end

  defp remote_addr(%Plug.Conn{remote_ip: remote_ip}) do
    case :inet.ntoa(remote_ip) do
      {:error, :einval} ->
        to_string(remote_ip)

      charlist ->
        List.to_string(charlist)
    end
  end

  defp transform_params_to_submission_map(params) do
    sanitized_params = Map.drop(params, ["form_id", "id"])

    # Separate attachments from other fields
    attachments = extract_file_params(sanitized_params)
    attachment_field_names = Enum.map(attachments, & &1["field_name"]) |> Enum.uniq()
    fields = Map.drop(sanitized_params, attachment_field_names)

    # Merge request params into submission-like map
    #   @TODO: Search through nested param maps
    #   @TODO: Allow users to map submitted form fields into sender/body for improved previews
    %{
      "attachments" => attachments,
      "body" => detect_body_field(sanitized_params),
      "fields" => fields,
      "form_id" => params["form_id"],
      "sender" => detect_sender_field(sanitized_params)
    }
  end
end
