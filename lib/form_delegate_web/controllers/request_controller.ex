defmodule FormDelegateWeb.RequestController do
  use FormDelegateWeb, :controller

  alias FormDelegate.Accounts.User
  alias FormDelegate.{Forms, Forms.Form}
  alias FormDelegate.{Messages, Messages.Message}

  require Logger

  action_fallback FormDelegateWeb.FallbackController

  # @TODO: Check that form.verified is true
  # @TODO: Responds with /requests/:form_id/:request_id link alongside 202
  # @TODO: Apply some form of spam filtering before Akismet is used
  # @TODO: Allow user to specify redirect after submission
  def create(conn, %{"id" => form_id} = params) do
    grouped_message_params = transform_params_to_message_map(params)

    with %Form{} = form <- Forms.get_form!(form_id),
         {:ok, %Message{} = message} <- Messages.create_message(form, grouped_message_params) do
      # @TODO: Allow user-specified Akismet API key per form
      case akismet_api().is_spam?(System.get_env("AKISMET_API_KEY"), conn, message) do
        {:ok, false} ->
          Logger.info("FD: Integrations running. No spam detected by Akismet.")
          Rihanna.enqueue(FormDelegate.SubmissionQueueJob, [form, message])

        {:ok, true} ->
          Logger.info("FD: Spam detected by Akismet.")
          # @TODO: Refactor and remove need for second db call to add spam flag
          Messages.flag_message(message, %{
            flagged_at: NaiveDateTime.utc_now(),
            flagged_type:
              Messages.get_or_create_flagged_type(%{
                type: "spam"
              })
          })

        {:error, error} ->
          Logger.error("FD: Akismet error: #{inspect(error)}")
      end

      # Broadcast message to user's channel after processing spam filters
      broadcast_message(message)

      # Send identical accepted response to all requests
      body = Jason.encode!(%{message: "Accepted"})

      conn
      |> put_resp_header("content-type", "application/json")
      |> send_resp(:accepted, body)
    end
  end

  defp transform_params_to_message_map(params) do
    # @TODO: Allow users to map submitted form fields into sender/title/content
    potential_content_fields = ["message", "content", "body"]
    potential_title_fields = ["title", "subject"]
    potential_sender_fields = ["name", "sender", "full_name", "email"]

    # Filter params into known and unknown groups based on potential field hits
    known_fields =
      ["id"] ++ potential_sender_fields ++ potential_title_fields ++ potential_content_fields

    unknown_fields = Map.drop(params, known_fields)

    # Merge request params into message-like map
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

  defp broadcast_message(%Message{} = message) do
    %Message{user: %User{id: form_user_id}} = message

    FormDelegateWeb.Endpoint.broadcast!(
      "form_message:" <> to_string(form_user_id),
      "new_msg",
      Phoenix.View.render(FormDelegateWeb.MessageView, "show.json", message: message)
    )
  end

  defp akismet_api do
    Application.get_env(:form_delegate, :akismet_api)
  end
end
