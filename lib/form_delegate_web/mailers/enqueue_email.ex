defmodule FormDelegateWeb.Mailers.EnqueueEmail do
  @behaviour Rihanna.Job

  alias Bamboo.Email
  alias FormDelegateWeb.MailService

  require Logger

  def perform(%Email{} = email) do
    {%Email{}, response} = MailService.deliver_now(email, response: true)

    # If :status_code isn't in response map then the Bamboo test adapter is likely being used?
    # @TODO: Verify the above statement is true and if not then try to refactor and use pattern matching
    if Map.has_key?(response, :status_code) do
      case Map.get(response, :status_code) do
        status when status < 299 ->
          Logger.info("FD EnqueueEmail: Received success status response from Bamboo adapter")
          {:ok, response}

        _ ->
          Logger.error("FD EnqueueEmail: Received error status response from Bamboo adapter")
          {:error, response}
      end
    else
      Logger.error("FD EnqueueEmail: Did not receive status response from Bamboo adapter")
      {:ok, response}
    end
  end
end
