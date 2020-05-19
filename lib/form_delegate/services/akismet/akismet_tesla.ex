defmodule FormDelegate.Services.Akismet.Tesla do
  alias FormDelegate.Submissions.Submission
  alias FormDelegate.Services.Akismet

  @behaviour Akismet

  use Tesla, only: [:post], docs: false

  plug(Tesla.Middleware.FormUrlencoded)
  plug(Tesla.Middleware.Headers, [{"user-agent", "Form Delegate"}])
  plug(Tesla.Middleware.JSON)

  @impl Akismet
  def is_spam?(api_key, submission = %Submission{}) do
    request_body = %{
      blog: "https://formdelegate.com",
      # comment_author_email: "akismet-guaranteed-spam@example.com",
      comment_author_email: submission.sender,
      comment_content: submission.content,
      comment_type: "contact-form",
      referrer: submission.sender_referrer,
      user_agent: submission.sender_user_agent,
      user_ip: submission.sender_ip
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
  def submit_ham(api_key, submission = %Submission{}) do
    request_body = %{
      blog: "https://formdelegate.com",
      comment_author_email: submission.sender,
      comment_content: submission.content,
      comment_type: "contact-form",
      referrer: submission.sender_referrer,
      user_agent: submission.sender_user_agent,
      user_ip: submission.sender_ip
    }

    case post(
           "https://#{api_key}.rest.akismet.com/1.1/submit-ham",
           request_body
         ) do
      {:ok, %Tesla.Env{status: 200, body: "Thanks for making the web a better place."}} ->
        {:ok, true}

      {:ok, %Tesla.Env{status: 200, body: body}} ->
        {:error, body}

      {_, response} ->
        {:error, response}
    end
  end

  @impl Akismet
  def submit_spam(api_key, submission = %Submission{}) do
    request_body = %{
      blog: "https://formdelegate.com",
      comment_author_email: submission.sender,
      comment_content: submission.content,
      comment_type: "contact-form",
      referrer: submission.sender_referrer,
      user_agent: submission.sender_user_agent,
      user_ip: submission.sender_ip
    }

    case post(
           "https://#{api_key}.rest.akismet.com/1.1/submit-spam",
           request_body
         ) do
      {:ok, %Tesla.Env{status: 200, body: "Thanks for making the web a better place."}} ->
        {:ok, true}

      {:ok, %Tesla.Env{status: 200, body: body}} ->
        {:error, body}

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
end
