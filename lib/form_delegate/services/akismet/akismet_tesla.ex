defmodule FormDelegate.Services.Akismet.Tesla do
  alias FormDelegate.Messages.Message
  alias FormDelegate.Services.Akismet

  @behaviour Akismet

  use Tesla, only: [:post], docs: false

  plug(Tesla.Middleware.FormUrlencoded)
  plug(Tesla.Middleware.Headers, [{"user-agent", "Form Delegate"}])
  plug(Tesla.Middleware.JSON)

  @impl Akismet
  def is_spam?(api_key, conn, message = %Message{}) do
    request_body = %{
      blog: "https://formdelegate.com",
      # comment_author_email: "akismet-guaranteed-spam@example.com",
      comment_author_email: message.sender,
      comment_content: message.content,
      comment_type: "contact-form",
      referrer: Plug.Conn.get_req_header(conn, "referer") |> to_string(),
      user_agent: Plug.Conn.get_req_header(conn, "user-agent") |> to_string(),
      user_ip: remote_addr(conn)
    }

    case post(
           "https://#{api_key}.rest.akismet.com/1.1/comment-check",
           request_body
         ) do
      {:ok, %Tesla.Env{status: 200, body: "true"}} ->
        {:ok, true}

      {:ok, %Tesla.Env{status: 200, body: "false"}} ->
        {:ok, false}

      {_, response} ->
        {:error, response}
    end
  end

  @impl Akismet
  def verify_key(api_key) do
    request_body = %{key: api_key, blog: "https://formdelegate.com"}

    case post("https://rest.akismet.com/1.1/verify-key", request_body) do
      {:ok, %Tesla.Env{status: 200, body: body}} when body == "valid" -> {:ok, body}
      {_, response} -> {:error, response}
    end
  end

  defp remote_addr(%Plug.Conn{remote_ip: remote_ip}) do
    case :inet.ntoa(remote_ip) do
      {:error, :einval} ->
        to_string(remote_ip)

      charlist ->
        List.to_string(charlist)
    end
  end
end
