defmodule FormDelegateWeb.SubmissionController do
  use FormDelegateWeb, :controller

  require Logger

  alias FormDelegate.Accounts.User
  alias FormDelegate.{Forms, Forms.Form}
  alias FormDelegate.{Submissions, Submissions.Submission}
  alias FormDelegateWeb.Authorizer

  action_fallback FormDelegateWeb.FallbackController

  def action(conn, _opts) do
    args = [conn, conn.params, conn.assigns[:current_user] || :guest]
    apply(__MODULE__, action_name(conn), args)
  end

  # @TODO: Check that form.verified is true
  # @TODO: Responds with /submissions/:submission_id link alongside 202
  # @TODO: Apply some form of spam filtering before Akismet is used
  # @TODO: Allow user to specify redirect after submission
  def create(conn, %{"form_id" => form_id} = params, current_user) do
    grouped_submission_params = transform_params_to_submission_map(params)

    meta_params = %{
      "sender_ip" => remote_addr(conn),
      "sender_referrer" => Plug.Conn.get_req_header(conn, "referer") |> to_string(),
      "sender_user_agent" => Plug.Conn.get_req_header(conn, "user-agent") |> to_string()
    }

    merged_params = Map.merge(grouped_submission_params, meta_params)

    with :ok <- Authorizer.authorize(:create_submission, current_user),
         %Form{} = form <- Forms.get_form!(form_id),
         {:ok, %Submission{} = submission} <- Submissions.create_submission(form, merged_params) do
      # @TODO: Allow user-specified Akismet API key per form
      case akismet_api().is_spam?(System.get_env("AKISMET_API_KEY"), submission) do
        {:ok, false} ->
          Logger.info("FD: Integrations running. No spam detected by Akismet.")
          Rihanna.enqueue(FormDelegate.SubmissionQueueJob, [form, submission])

        {:ok, true} ->
          Logger.info("FD: Spam detected by Akismet.")
          # @TODO: Refactor and remove need for second db call to add spam flag
          Submissions.flag_submission(submission, %{
            flagged_at: NaiveDateTime.utc_now(),
            flagged_type:
              Submissions.get_or_create_flagged_type(%{
                type: "spam"
              })
          })

        {:error, error} ->
          Logger.error("FD: Akismet error: #{inspect(error)}")
      end

      # Broadcast submission to user's channel after processing spam filters
      broadcast_submission(submission)

      # Send identical accepted response to all requests
      body = Jason.encode!(%{submission: "Accepted"})

      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:accepted, body)
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
         {:ok, true} <- akismet_api().submit_ham(System.get_env("AKISMET_API_KEY"), submission) do
      render(conn, "show.json", submission: submission)
    end
  end

  def index(conn, params, current_user) do
    with :ok <- Authorizer.authorize(:show_user_submissions, current_user) do
      page =
        cond do
          params["query"] -> Submissions.list_search_submissions_of_user(current_user, params)
          true -> Submissions.list_submissions_of_user(current_user, params)
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
             flagged_at: NaiveDateTime.utc_now(),
             flagged_type:
               Submissions.get_or_create_flagged_type(%{
                 type: "spam"
               })
           }),
         {:ok, true} <- akismet_api().submit_spam(System.get_env("AKISMET_API_KEY"), submission) do
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
    %Submission{user: %User{id: form_user_id}} = submission

    FormDelegateWeb.Endpoint.broadcast!(
      "form_submission:" <> to_string(form_user_id),
      "new_msg",
      Phoenix.View.render(FormDelegateWeb.SubmissionView, "show.json", submission: submission)
    )
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
    # @TODO: Allow users to map submitted form fields into sender/title/content
    potential_content_fields = ["submission", "content", "body"]
    potential_title_fields = ["title", "subject"]
    potential_sender_fields = ["name", "sender", "full_name", "email"]

    # Filter params into known and unknown groups based on potential field hits
    known_fields =
      ["form_id"] ++
        ["sender_ip"] ++
        ["sender_user_agent"] ++
        ["sender_referrer"] ++
        potential_sender_fields ++ potential_title_fields ++ potential_content_fields

    unknown_fields = Map.drop(params, known_fields)

    # Merge request params into submission-like map
    #   @TODO: Preserve fields that are dropped due to multiple matches within each potential
    #          field grouping
    #   @TODO: Search through nested param maps
    #   @TODO: Limit selection to one known field per key, sending the remaining to unknown_fields
    #          (e.g., name and email fields both present in params).
    %{
      "content" => Enum.find_value(potential_content_fields, &Map.get(params, &1)),
      "sender" => Enum.find_value(potential_sender_fields, &Map.get(params, &1)),
      "title" => Enum.find_value(potential_title_fields, &Map.get(params, &1)),
      "unknown_fields" => unknown_fields
    }
  end
end
