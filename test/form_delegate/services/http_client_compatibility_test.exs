defmodule FormDelegate.Services.HTTPClientCompatibilityTest do
  use ExUnit.Case, async: false

  alias FormDelegate.Integrations.Webhooks.HTTPClient

  defmodule LocalEndpoint do
    import Plug.Conn

    def init(owner), do: owner

    def call(conn, owner) do
      {:ok, body, conn} = read_body(conn)
      send(owner, {:http_request, conn.method, conn.request_path, conn.req_headers, body})

      case conn.request_path do
        "/v1/customers/cus_smoke" ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(200, ~s({"object":"customer","id":"cus_smoke"}))

        "/webhook" ->
          # Keep the response body open: acknowledgement must only wait for headers.
          conn = send_chunked(conn, 202)
          send(owner, {:response_open, self()})

          receive do
            :finish -> conn
          after
            6_000 -> conn
          end

        _ ->
          conn
          |> put_resp_content_type("application/octet-stream")
          |> send_resp(200, "synthetic download")
      end
    end
  end

  setup do
    ref = make_ref()

    start_supervised!(
      {Plug.Cowboy,
       scheme: :http,
       plug: {LocalEndpoint, self()},
       options: [port: 0, ip: {127, 0, 0, 1}, ref: ref]}
    )

    port = :ranch.get_port(ref)
    {:ok, port: port, url: "http://127.0.0.1:#{port}"}
  end

  test "Waffle downloads through Req and preserves file content", %{url: url} do
    assert Application.fetch_env!(:waffle, :http_client) == Waffle.HTTPClient.Req

    assert %Waffle.File{path: path, file_name: "download.txt"} =
             Waffle.File.new(url <> "/download.txt", FormDelegate.Uploaders.SubmissionAttachment)

    on_exit(fn -> File.rm(path) end)
    assert File.read!(path) == "synthetic download"
    assert_receive {:http_request, "GET", "/download.txt", _, ""}
  end

  test "ExAws performs a signed S3 read through Req", %{port: port} do
    assert Application.fetch_env!(:ex_aws, :http_client) == ExAws.Request.Req

    assert {:ok, %{status_code: 200, body: "synthetic download"}} =
             ExAws.S3.get_object("smoke-bucket", "download.txt")
             |> ExAws.request(
               access_key_id: "synthetic-key",
               secret_access_key: "synthetic-secret",
               region: "us-east-1",
               scheme: "http://",
               host: "127.0.0.1",
               port: port
             )

    assert_receive {:http_request, "GET", "/smoke-bucket/download.txt", headers, ""}
    assert {"authorization", "AWS4-HMAC-SHA256 " <> _} = List.keyfind(headers, "authorization", 0)
  end

  test "Stripe's real HTTP client decodes a customer with Hackney 4", %{url: url} do
    previous = Application.fetch_env(:stripity_stripe, :api_base_url)
    Application.put_env(:stripity_stripe, :api_base_url, url)

    on_exit(fn ->
      case previous do
        {:ok, value} -> Application.put_env(:stripity_stripe, :api_base_url, value)
        :error -> Application.delete_env(:stripity_stripe, :api_base_url)
      end
    end)

    assert {:ok, %Stripe.Customer{id: "cus_smoke"}} =
             Stripe.Customer.retrieve("cus_smoke", %{}, api_key: "synthetic-key")

    assert_receive {:http_request, "GET", "/v1/customers/cus_smoke", headers, ""}
    assert {"stripe-version", "2025-11-17.clover"} in headers
  end

  test "webhook transport preserves the pinned host and does not buffer a response body", %{
    port: port
  } do
    target = %{
      uri: URI.parse("http://hooks.example.test:#{port}/webhook"),
      address: {127, 0, 0, 1}
    }

    assert {:ok, 202} = HTTPClient.post(target, [], "payload")
    assert_receive {:http_request, "POST", "/webhook", headers, "payload"}
    assert {"host", "hooks.example.test"} in headers
    assert_receive {:response_open, handler}
    send(handler, :finish)
  end
end
