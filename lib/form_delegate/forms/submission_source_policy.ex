defmodule FormDelegate.Forms.SubmissionSourcePolicy do
  @moduledoc """
  Evaluates whether a browser submission came from a host allowed by a form.

  Source headers are useful for browser-originated abuse reduction, but they are
  not authentication because non-browser clients can forge them.
  """

  alias FormDelegate.Forms.{Form, HostRule}

  @type denial_reason :: :missing_source | :malformed_source | :host_mismatch
  @type result :: :ok | {:error, denial_reason(), String.t() | nil}

  def check(
        %Form{submission_source_policy: :unrestricted},
        _origin_headers,
        _referer_headers
      ),
      do: :ok

  def check(
        %Form{submission_source_policy: :restricted, hosts: hosts},
        origin_headers,
        referer_headers
      ) do
    with {:ok, observed_host} <- source_host(origin_headers, referer_headers) do
      if Enum.any?(hosts || [], &host_matches?(&1, observed_host)) do
        :ok
      else
        {:error, :host_mismatch, observed_host}
      end
    end
  end

  defp source_host([], referer_headers), do: referer_host(referer_headers)

  defp source_host([origin], _referer_headers) do
    parse_source(origin, :origin)
  end

  defp source_host(_multiple_origins, _referer_headers) do
    {:error, :malformed_source, nil}
  end

  defp referer_host([]), do: {:error, :missing_source, nil}
  defp referer_host([referer]), do: parse_source(referer, :referer)
  defp referer_host(_multiple_referers), do: {:error, :malformed_source, nil}

  defp parse_source("null", :origin), do: {:error, :malformed_source, nil}

  defp parse_source(value, source_type) when is_binary(value) do
    with true <- value == String.trim(value),
         false <- contains_control_character?(value),
         {:ok, uri} <- URI.new(value),
         true <- valid_common_uri?(uri),
         true <- valid_source_uri?(uri, source_type),
         {:ok, normalized_host} <- HostRule.normalize_observed_host(uri.host) do
      {:ok, normalized_host}
    else
      _ -> {:error, :malformed_source, nil}
    end
  end

  defp parse_source(_value, _source_type), do: {:error, :malformed_source, nil}

  defp valid_common_uri?(%URI{} = uri) do
    String.downcase(uri.scheme || "") in ["http", "https"] and
      is_binary(uri.host) and uri.host != "" and is_nil(uri.userinfo) and is_nil(uri.fragment)
  end

  defp valid_source_uri?(%URI{} = uri, :origin) do
    uri.path in [nil, "", "/"] and is_nil(uri.query)
  end

  defp valid_source_uri?(%URI{}, :referer), do: true

  defp contains_control_character?(value) do
    value
    |> :binary.bin_to_list()
    |> Enum.any?(&(&1 < 32 or &1 == 127))
  end

  defp host_matches?("*." <> allowed_host, observed_host) do
    String.ends_with?(observed_host, "." <> allowed_host)
  end

  defp host_matches?(allowed_host, observed_host), do: allowed_host == observed_host
end
