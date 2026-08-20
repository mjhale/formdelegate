defmodule FormDelegate.Forms.FormTest do
  use FormDelegate.DataCase, async: true

  alias FormDelegate.Forms.Form

  describe "changeset/2 submission sources" do
    test "defaults to unrestricted" do
      changeset = Form.changeset(%Form{}, %{name: "Contact"})

      assert changeset.valid?
      assert Ecto.Changeset.get_field(changeset, :submission_source_policy) == :unrestricted
    end

    test "normalizes and deduplicates hosts" do
      changeset =
        Form.changeset(%Form{}, %{
          name: "Contact",
          hosts: [" Example.COM. ", "example.com", "*.EXAMPLE.org.", "", " [::1] "]
        })

      assert changeset.valid?

      assert Ecto.Changeset.get_change(changeset, :hosts) == [
               "example.com",
               "*.example.org",
               "::1"
             ]
    end

    test "accepts exact hosts, explicit wildcards, localhost, and IP addresses" do
      changeset =
        Form.changeset(%Form{}, %{
          name: "Contact",
          submission_source_policy: :restricted,
          hosts: ["example.com", "*.example.org", "localhost", "127.0.0.1", "::1"]
        })

      assert changeset.valid?
    end

    test "rejects URLs, ports, invalid labels, invalid wildcards, and unicode hosts" do
      invalid_hosts = [
        "https://example.com",
        "example.com:443",
        "-example.com",
        "example..com",
        "*example.com",
        "foo.*.example.com",
        "*.127.0.0.1",
        "*.localhost",
        "999.1.1.1",
        "münich.example"
      ]

      for host <- invalid_hosts do
        changeset = Form.changeset(%Form{}, %{name: "Contact", hosts: [host]})

        refute changeset.valid?, "expected #{inspect(host)} to be invalid"
        assert "contains an invalid hostname or wildcard" in errors_on(changeset).hosts
      end
    end

    test "requires at least one host when restricted" do
      changeset =
        Form.changeset(%Form{}, %{
          name: "Contact",
          submission_source_policy: :restricted,
          hosts: []
        })

      refute changeset.valid?

      assert "must include at least one hostname when restricted" in errors_on(changeset).hosts
    end

    test "requires a valid submission source policy" do
      changeset =
        Form.changeset(%Form{}, %{
          name: "Contact",
          submission_source_policy: nil
        })

      refute changeset.valid?
      assert "can't be blank" in errors_on(changeset).submission_source_policy
    end

    test "limits each host rule to 253 characters" do
      oversized_host = String.duplicate("a", 63) <> "." <> String.duplicate("b", 190)
      changeset = Form.changeset(%Form{}, %{name: "Contact", hosts: [oversized_host]})

      refute changeset.valid?
      assert "contains an invalid hostname or wildcard" in errors_on(changeset).hosts
    end

    test "allows stored hosts while unrestricted" do
      changeset =
        Form.changeset(%Form{}, %{
          name: "Contact",
          submission_source_policy: :unrestricted,
          hosts: ["example.com"]
        })

      assert changeset.valid?
    end

    test "limits a form to fifty hosts" do
      hosts = Enum.map(1..51, &"host-#{&1}.example.com")
      changeset = Form.changeset(%Form{}, %{name: "Contact", hosts: hosts})

      refute changeset.valid?
      assert "should have at most 50 item(s)" in errors_on(changeset).hosts
    end
  end
end
