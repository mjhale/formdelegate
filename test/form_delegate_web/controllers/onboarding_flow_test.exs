defmodule FormDelegateWeb.OnboardingFlowTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegate.BillingCounts
  alias FormDelegate.Forms.Form
  alias FormDelegate.Integrations.EmailIntegration
  alias FormDelegate.Repo
  alias FormDelegate.Submissions.{Attachment, Submission}

  defmodule SMTPReceiver do
    def verify(%{password: "invalid"}), do: {:error, "invalid SMTP credentials"}
    def verify(_params), do: :ok

    def deliver(params, email) do
      send(
        Application.fetch_env!(:form_delegate, :onboarding_receiver),
        {:delivered, params, email}
      )

      :ok
    end
  end

  setup %{user: user} do
    settings = [
      email_provider_smtp_client: SMTPReceiver,
      email_provider_smtp_delivery_client: SMTPReceiver,
      onboarding_receiver: self(),
      akismet_api: FormDelegate.Services.Akismet.InMemory,
      akismet_api_key: nil,
      frontend_url: "http://127.0.0.1:3308"
    ]

    previous =
      Enum.map(settings, fn {key, _value} -> {key, Application.fetch_env(:form_delegate, key)} end)

    Enum.each(settings, fn {key, value} -> Application.put_env(:form_delegate, key, value) end)

    on_exit(fn ->
      Enum.each(previous, fn
        {key, {:ok, value}} -> Application.put_env(:form_delegate, key, value)
        {key, :error} -> Application.delete_env(:form_delegate, key)
      end)
    end)

    user = user |> Ecto.Changeset.change(confirmed_at: DateTime.utc_now()) |> Repo.update!()
    {:ok, jwt, _claims} = FormDelegateWeb.Guardian.encode_and_sign(user)
    {:ok, jwt: jwt}
  end

  @tag :as_inserted_user
  test "API onboarding persists settings, recovers from errors and receives authorized submissions",
       %{
         jwt: jwt,
         team: team
       } do
    forms_path = "/v1/teams/#{team.id}/forms"

    assert json_response(post(auth(jwt), forms_path, form: %{name: "   "}), 422)
    assert Repo.aggregate(Form, :count) == 0

    created = post(auth(jwt), forms_path, form: %{name: "Contact"}) |> json_response(201)
    id = created["data"]["id"]
    form_path = "#{forms_path}/#{id}"
    intake_path = "/v1/submissions/#{id}"
    assert created["data"]["submission_count"] == 0
    assert created["data"]["spam_filter_mode"] == "balanced"

    # Full URLs must be corrected to hostnames; invalid saves are atomic.
    invalid = %{
      name: "Do not persist",
      hosts: ["https://example.com/contact"],
      submission_source_policy: "restricted"
    }

    assert json_response(put(auth(jwt), form_path, form: invalid), 422)
    assert Repo.get!(Form, id).name == "Contact"

    settings = %{
      name: "Website contact",
      hosts: ["EXAMPLE.COM", "*.example.org", "example.com"],
      submission_source_policy: "restricted"
    }

    for _attempt <- 1..2 do
      response = put(auth(jwt), form_path, form: settings) |> json_response(200)
      assert response["data"]["hosts"] == ["example.com", "*.example.org"]
    end

    assert BillingCounts.get_latest_billing_count_of_team(team.id).form_count == 1

    # A rejected credential check must not partially save settings or integrations.
    bad_integration = integration("invalid")

    assert json_response(
             put(auth(jwt), form_path,
               form: %{name: "Failed save", email_integrations: [bad_integration]}
             ),
             400
           )

    assert Repo.get!(Form, id).name == "Website contact"
    assert Repo.aggregate(EmailIntegration, :count) == 0

    configured =
      put(auth(jwt), form_path, form: %{email_integrations: [integration("local-fixture")]})
      |> json_response(200)

    [email_integration] = configured["data"]["email_integrations"]
    assert email_integration["email_provider_status"] == "verified"
    refute Map.has_key?(email_integration, "email_provider_secrets")

    persisted = get(auth(jwt), form_path) |> json_response(200)
    assert persisted["data"]["email_integrations"] == [email_integration]
    assert persisted["data"]["submission_source_policy"] == "restricted"

    assert Repo.get!(EmailIntegration, email_integration["id"]).email_provider_secrets["password"] ==
             "local-fixture"

    for origin <- [
          nil,
          "null",
          "https://evil.example",
          "https://example.com.evil.test",
          "https://example.org"
        ] do
      conn = if origin, do: put_req_header(json(), "origin", origin), else: json()
      response = post(conn, intake_path, %{message: "Rejected"}) |> json_response(403)
      assert response["error"]["type"] == "SUBMISSION_SOURCE_NOT_ALLOWED"
    end

    assert Repo.aggregate(Submission, :count) == 0
    assert BillingCounts.get_latest_billing_count_of_team(team.id).submission_count == 0
    refute_receive {:delivered, _, _}

    assert json_response(
             post(put_req_header(json(), "origin", "https://example.com"), intake_path, %{}),
             422
           )

    for {header, source} <- [
          {"origin", "https://example.com"},
          {"origin", "https://www.example.org"},
          {"referer", "https://example.com/contact"}
        ] do
      assert json_response(
               post(put_req_header(json(), header, source), intake_path, %{
                 message: "A local onboarding inquiry from #{source}",
                 name: "Test visitor"
               }),
               202
             )

      assert_receive {:delivered, %{host: "localhost"}, email}
      assert email.to == [{"", "owner@example.com"}]
      assert email.text_body =~ "A local onboarding inquiry"
    end

    assert Repo.get!(Form, id).submission_count == 3
    assert BillingCounts.get_latest_billing_count_of_team(team.id).submission_count == 3
    inbox = get(auth(jwt), "/v1/teams/#{team.id}/submissions") |> json_response(200)
    assert length(inbox["data"]) == 3
    assert Enum.all?(inbox["data"], &is_nil(&1["flagged_at"]))

    assert json_response(
             post(put_req_header(json(), "origin", "https://example.com"), intake_path, %{
               message:
                 "Claim your prize. https://one.example https://two.example https://three.example https://four.example",
               name: "Test visitor"
             }),
             202
           )

    refute_receive {:delivered, _, _}
    inbox = get(auth(jwt), "/v1/teams/#{team.id}/submissions") |> json_response(200)
    submission = Enum.find(inbox["data"], &(&1["flagged_at"] != nil))
    assert submission["flagged_type"]["type"] == "spam"
    moderation_path = "/v1/teams/#{team.id}/submissions/#{submission["id"]}"
    flagged = put(auth(jwt), "#{moderation_path}/spam") |> json_response(200)
    assert flagged["data"]["flagged_type"]["type"] == "spam"

    for _attempt <- 1..2 do
      approved = put(auth(jwt), "#{moderation_path}/ham") |> json_response(200)
      assert approved["data"]["flagged_at"] == nil
      assert approved["data"]["flagged_type"] == nil
      assert approved["data"]["moderation_status"] == "approved"
    end

    assert_receive {:delivered, %{host: "localhost"}, approved_email}
    assert approved_email.text_body =~ "Claim your prize."
    refute_receive {:delivered, _, _}

    assert Repo.get!(Form, id).submission_count == 4
    assert BillingCounts.get_latest_billing_count_of_team(team.id).submission_count == 4
  end

  @tag :as_inserted_user
  test "API intake stores attachment bytes locally and accounts for storage", %{
    jwt: jwt,
    team: team
  } do
    root =
      Path.join(
        System.tmp_dir!(),
        "formdelegate-onboarding-#{System.unique_integer([:positive])}"
      )

    File.mkdir_p!(root)
    options = [storage: Waffle.Storage.Local, storage_dir_prefix: root, asset_host: nil]
    previous = Enum.map(options, fn {key, _} -> {key, Application.fetch_env(:waffle, key)} end)
    Enum.each(options, fn {key, value} -> Application.put_env(:waffle, key, value) end)

    on_exit(fn ->
      Enum.each(previous, fn
        {key, {:ok, value}} -> Application.put_env(:waffle, key, value)
        {key, :error} -> Application.delete_env(:waffle, key)
      end)

      File.rm_rf!(root)
    end)

    body = "Local onboarding attachment."
    source = Path.join(root, "probe.txt")
    File.write!(source, body)

    created =
      post(auth(jwt), "/v1/teams/#{team.id}/forms", form: %{name: "File intake"})
      |> json_response(201)

    form_id = created["data"]["id"]
    upload = %Plug.Upload{path: source, filename: "probe.txt", content_type: "text/plain"}

    assert json_response(
             post(json(), "/v1/submissions/#{form_id}", %{
               message: "With attachment",
               document: upload
             }),
             202
           )

    attachment = Repo.one!(Attachment)
    assert attachment.file_size == byte_size(body)
    assert attachment.field_name == "document"

    stored =
      Path.join([
        root,
        "uploads",
        "submissions",
        attachment.submission_id,
        "document",
        "probe.txt"
      ])

    assert File.read!(stored) == body
    counts = BillingCounts.get_latest_billing_count_of_team(team.id)
    assert counts.storage_count == byte_size(body)
    assert counts.submission_count == 1
    assert Repo.get!(Form, form_id).submission_count == 1
  end

  defp json, do: build_conn() |> put_req_header("accept", "application/json")
  defp auth(jwt), do: json() |> put_req_header("authorization", "Bearer " <> jwt)

  defp integration(password) do
    %{
      enabled: true,
      email_provider: "smtp",
      email_provider_status: "pending_verification",
      verify_provider: true,
      email_provider_config: %{
        host: "localhost",
        port: 2525,
        username: "local",
        from_address: "sender@example.com"
      },
      email_provider_secrets: %{password: password},
      email_integration_recipients: [%{email: "owner@example.com", type: "to"}]
    }
  end
end
