defmodule FormDelegateWeb.FormWebhooksTest do
  use FormDelegateWeb.ConnCase
  alias FormDelegate.{Forms, Repo}
  alias FormDelegate.Integrations.WebhookIntegration
  @moduletag :as_inserted_user
  @secret "synthetic-webhook-signing-secret-000000"

  setup %{conn: conn, user: user} do
    FormDelegate.WebhookTestSetup.install()
    {:ok, jwt, _} = FormDelegateWeb.Guardian.encode_and_sign(user)
    {:ok, conn: put_req_header(conn, "authorization", "bearer: " <> jwt)}
  end

  defp attrs,
    do: %{
      enabled: true,
      url: "https://hooks.vendor.com/event?source=form",
      signing_secret: @secret
    }

  test "create/read/update omit secrets, preserve them on edit, rotate and remove", %{conn: conn} do
    response =
      post(conn, form_path(conn, :create),
        form: %{name: "Webhooks", webhook_integrations: [attrs()]}
      )
      |> json_response(201)

    form_id = response["data"]["id"]
    [webhook] = response["data"]["webhook_integrations"]
    assert Map.keys(webhook) |> Enum.sort() == ~w(enabled has_signing_secret id url)
    assert webhook["has_signing_secret"] == true
    refute Jason.encode!(response) =~ @secret
    assert Repo.get!(WebhookIntegration, webhook["id"]).signing_secret == @secret

    update = %{id: webhook["id"], enabled: false, url: "https://hooks.vendor.com/changed"}

    updated =
      put(conn, form_path(conn, :update, form_id), form: %{webhook_integrations: [update]})
      |> json_response(200)

    assert hd(updated["data"]["webhook_integrations"])["enabled"] == false
    assert Repo.get!(WebhookIntegration, webhook["id"]).signing_secret == @secret

    refute Jason.encode!(get(conn, form_path(conn, :show, form_id)) |> json_response(200)) =~
             @secret

    rotated = String.duplicate("r", 32)

    put(conn, form_path(conn, :update, form_id),
      form: %{webhook_integrations: [Map.put(update, :signing_secret, rotated)]}
    )
    |> json_response(200)

    assert Repo.get!(WebhookIntegration, webhook["id"]).signing_secret == rotated

    put(conn, form_path(conn, :update, form_id), form: %{webhook_integrations: []})
    |> json_response(200)

    assert Repo.get(WebhookIntegration, webhook["id"]) == nil
  end

  test "rejects incomplete, unsafe and excessive integrations with no secrets in errors", %{
    conn: conn
  } do
    for webhooks <- [
          [Map.delete(attrs(), :signing_secret)],
          [%{attrs() | signing_secret: "short"}],
          [%{attrs() | url: "https://127.0.0.1"}],
          List.duplicate(attrs(), 4)
        ] do
      response =
        post(conn, form_path(conn, :create),
          form: %{name: "Invalid", webhook_integrations: webhooks}
        )
        |> json_response(422)

      assert response["error"]["errors"]["webhook_integrations"]
      refute Jason.encode!(response) =~ @secret
    end
  end

  test "rejects excessive lists and indexed maps before any DNS resolution", %{conn: conn} do
    hooks = List.duplicate(attrs(), 4)

    indexed =
      hooks |> Enum.with_index() |> Map.new(fn {hook, index} -> {to_string(index), hook} end)

    for input <- [hooks, indexed] do
      response =
        post(conn, form_path(conn, :create),
          form: %{name: "Too many", webhook_integrations: input}
        )
        |> json_response(422)

      assert response["error"]["errors"]["webhook_integrations"] == [
               "should have at most 3 item(s)"
             ]

      refute_receive {:resolved, _}
    end
  end

  test "omitted and malformed webhook associations never resolve destinations", %{conn: conn} do
    post(conn, form_path(conn, :create), form: %{name: "No hooks"}) |> json_response(201)

    for input <- [nil, "invalid", true, 42] do
      response =
        post(conn, form_path(conn, :create),
          form: %{name: "Malformed", webhook_integrations: input}
        )
        |> json_response(422)

      assert response["error"]["errors"]["webhook_integrations"]
    end

    refute_receive {:resolved, _}
  end

  test "foreign integration IDs and forms cannot be modified", %{
    conn: conn,
    user: user,
    team: team
  } do
    {:ok, own} = Forms.create_form(%{name: "Own"}, user, team)
    foreign = insert(:form)

    hook =
      Repo.insert!(
        %WebhookIntegration{
          form_id: foreign.id,
          integration_type: :webhook,
          enabled: false,
          url: "https://hooks.vendor.com",
          signing_secret: @secret
        },
        log: false
      )

    response =
      put(conn, form_path(conn, :update, own.id),
        form: %{webhook_integrations: [Map.put(attrs(), :id, hook.id)]}
      )
      |> json_response(422)

    assert response["error"]["errors"]["webhook_integrations"]

    put(conn, form_path(conn, :update, foreign.id), form: %{webhook_integrations: []})
    |> json_response(403)

    assert Repo.get!(WebhookIntegration, hook.id).signing_secret == @secret
  end

  test "enabling unchanged URLs rechecks DNS and disabling survives DNS failure", %{
    user: user,
    team: team
  } do
    {:ok, form} =
      Forms.create_form(
        %{name: "DNS", webhook_integrations: [%{attrs() | enabled: false}]},
        user,
        team
      )

    [hook] = form.webhook_integrations
    Application.put_env(:form_delegate, :webhook_test_addresses, {:ok, [{127, 0, 0, 1}]})

    assert {:error, _} =
             Forms.update_form(form, %{webhook_integrations: [%{id: hook.id, enabled: true}]})

    # A previously enabled endpoint can always be disabled during an outage.
    Repo.update!(Ecto.Changeset.change(hook, enabled: true), log: false)
    form = Forms.get_form!(form.id)
    Application.put_env(:form_delegate, :webhook_test_addresses, {:error, :timeout})

    assert {:ok, disabled} =
             Forms.update_form(form, %{webhook_integrations: [%{id: hook.id, enabled: false}]})

    refute hd(disabled.webhook_integrations).enabled
  end
end
