defmodule FormDelegate.Forms.SubmissionSourcePolicyTest do
  use ExUnit.Case, async: true

  alias FormDelegate.Forms.{Form, SubmissionSourcePolicy}

  describe "check/3" do
    test "unrestricted forms accept missing and malformed source headers" do
      form = form(:unrestricted, nil)

      assert :ok = SubmissionSourcePolicy.check(form, [], [])
      assert :ok = SubmissionSourcePolicy.check(form, ["null"], ["not a URL"])
    end

    test "restricted forms accept an exact allowed Origin" do
      form = form(:restricted, ["example.com"])

      assert :ok = SubmissionSourcePolicy.check(form, ["https://example.com"], [])
      assert :ok = SubmissionSourcePolicy.check(form, ["HTTP://EXAMPLE.COM.:8080"], [])
    end

    test "exact rules do not include subdomains" do
      form = form(:restricted, ["example.com"])

      assert {:error, :host_mismatch, "www.example.com"} =
               SubmissionSourcePolicy.check(form, ["https://www.example.com"], [])
    end

    test "wildcards include descendants but not the apex or suffix attacks" do
      form = form(:restricted, ["*.example.com"])

      assert :ok = SubmissionSourcePolicy.check(form, ["https://www.example.com"], [])
      assert :ok = SubmissionSourcePolicy.check(form, ["https://a.b.example.com"], [])

      assert {:error, :host_mismatch, "example.com"} =
               SubmissionSourcePolicy.check(form, ["https://example.com"], [])

      assert {:error, :host_mismatch, "evil-example.com"} =
               SubmissionSourcePolicy.check(form, ["https://evil-example.com"], [])
    end

    test "accepts localhost, IPv4, and IPv6 hosts" do
      form = form(:restricted, ["localhost", "127.0.0.1", "::1"])

      assert :ok = SubmissionSourcePolicy.check(form, ["http://localhost:3000"], [])
      assert :ok = SubmissionSourcePolicy.check(form, ["http://127.0.0.1:3000"], [])
      assert :ok = SubmissionSourcePolicy.check(form, ["http://[::1]:3000"], [])
    end

    test "falls back to Referer only when Origin is absent" do
      form = form(:restricted, ["example.com"])

      assert :ok =
               SubmissionSourcePolicy.check(
                 form,
                 [],
                 ["https://example.com/contact?campaign=summer"]
               )

      assert {:error, :malformed_source, nil} =
               SubmissionSourcePolicy.check(form, ["not a URL"], ["https://example.com"])

      assert {:error, :host_mismatch, "evil.example"} =
               SubmissionSourcePolicy.check(
                 form,
                 ["https://evil.example"],
                 ["https://example.com/contact"]
               )
    end

    test "denies missing, null, malformed, and multiple source headers" do
      form = form(:restricted, ["example.com"])

      assert {:error, :missing_source, nil} = SubmissionSourcePolicy.check(form, [], [])

      assert {:error, :malformed_source, nil} =
               SubmissionSourcePolicy.check(form, ["null"], [])

      assert {:error, :malformed_source, nil} =
               SubmissionSourcePolicy.check(form, ["https://example.com/path"], [])

      assert {:error, :malformed_source, nil} =
               SubmissionSourcePolicy.check(
                 form,
                 ["https://example.com", "https://example.com"],
                 []
               )

      assert {:error, :malformed_source, nil} =
               SubmissionSourcePolicy.check(
                 form,
                 [],
                 ["https://example.com/one", "https://example.com/two"]
               )
    end

    test "rejects unsupported schemes, credentials, fragments, and control characters" do
      form = form(:restricted, ["example.com"])

      invalid_sources = [
        "ftp://example.com",
        "https://user:password@example.com",
        "https://example.com#fragment",
        " https://example.com",
        "https://example.com\n"
      ]

      for source <- invalid_sources do
        assert {:error, :malformed_source, nil} =
                 SubmissionSourcePolicy.check(form, [source], [])
      end
    end
  end

  defp form(policy, hosts) do
    %Form{submission_source_policy: policy, hosts: hosts}
  end
end
