defmodule FormDelegate.WebhookTestResolver do
  @moduledoc false
  def resolve(host) do
    if owner = Application.get_env(:form_delegate, :webhook_test_owner),
      do: send(owner, {:resolved, host})

    Application.get_env(:form_delegate, :webhook_test_addresses, {:ok, [{93, 184, 215, 14}]})
  end
end

defmodule FormDelegate.WebhookTestHTTP do
  @moduledoc false
  def post(target, headers, body) do
    send(
      Application.fetch_env!(:form_delegate, :webhook_test_owner),
      {:webhook_request, target, headers, body}
    )

    Application.get_env(:form_delegate, :webhook_test_response, {:ok, 204})
  end
end

defmodule FormDelegate.WebhookTestSetup do
  @moduledoc false
  def install do
    values = [
      webhook_resolver: FormDelegate.WebhookTestResolver,
      webhook_http_client: FormDelegate.WebhookTestHTTP,
      webhook_test_owner: self(),
      webhook_test_addresses: {:ok, [{93, 184, 215, 14}]},
      webhook_test_response: {:ok, 204}
    ]

    previous =
      Enum.map(values, fn {key, _} -> {key, Application.fetch_env(:form_delegate, key)} end)

    Enum.each(values, fn {key, value} -> Application.put_env(:form_delegate, key, value) end)

    ExUnit.Callbacks.on_exit(fn ->
      Enum.each(previous, fn
        {key, {:ok, value}} -> Application.put_env(:form_delegate, key, value)
        {key, :error} -> Application.delete_env(:form_delegate, key)
      end)
    end)

    :ok
  end
end
