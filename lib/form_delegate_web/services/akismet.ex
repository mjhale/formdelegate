defmodule FormDelegateWeb.Services.Akismet do
  use Tesla, only: [:post], docs: false

  plug(Tesla.Middleware.FormUrlencoded)
  plug(Tesla.Middleware.Headers, [{"user-agent", "Form Delegate"}])
  plug(Tesla.Middleware.JSON)

  def is_spam?(api_key, conn, message) do
    request_body = %{
      blog: "https://formdelegate.com",
      # comment_author_email: "akismet-guaranteed-spam@example.com",
      comment_content: message.content,
      comment_type: "contact-form",
      referrer: Plug.Conn.get_req_header(conn, "referer") |> to_string(),
      user_agent: Plug.Conn.get_req_header(conn, "user-agent") |> to_string(),
      user_ip: conn.remote_ip |> :inet_parse.ntoa() |> to_string()
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

  def verify_key(api_key) do
    request_body = %{key: api_key, blog: "https://formdelegate.com"}

    case post("https://rest.akismet.com/1.1/verify-key", request_body) do
      {:ok, %Tesla.Env{status: 200, body: body}} when body == "valid" -> {:ok, body}
      {_, response} -> {:error, response}
    end
  end
end
