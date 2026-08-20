defmodule FormDelegate.Forms.HostRule do
  @moduledoc false

  @max_length 253

  def normalize(rule) when is_binary(rule) do
    rule
    |> String.trim()
    |> String.downcase()
    |> String.trim_trailing(".")
    |> strip_ipv6_brackets()
  end

  def normalize_observed_host(host) when is_binary(host) do
    normalized_host = normalize(host)

    if String.starts_with?(normalized_host, "*.") or not valid?(normalized_host) do
      :error
    else
      {:ok, normalized_host}
    end
  end

  def normalize_observed_host(_host), do: :error

  def valid?("*." <> host) do
    byte_size(host) + 2 <= @max_length and not ip_address?(host) and host != "localhost" and
      valid_dns_name?(host)
  end

  def valid?(host) when is_binary(host) do
    byte_size(host) <= @max_length and
      (host == "localhost" or ip_address?(host) or
         (not numeric_dotted_address?(host) and valid_dns_name?(host)))
  end

  def valid?(_host), do: false

  defp strip_ipv6_brackets("[" <> rest = host) do
    if String.ends_with?(rest, "]") do
      String.slice(rest, 0, byte_size(rest) - 1)
    else
      host
    end
  end

  defp strip_ipv6_brackets(host), do: host

  defp ip_address?(host) do
    case :inet.parse_address(String.to_charlist(host)) do
      {:ok, _address} -> true
      {:error, :einval} -> false
    end
  end

  defp numeric_dotted_address?(host) do
    String.match?(host, ~r/^\d+(?:\.\d+)+$/)
  end

  defp valid_dns_name?(host) do
    byte_size(host) <= @max_length and ascii?(host) and
      host
      |> String.split(".")
      |> Enum.all?(&valid_dns_label?/1)
  end

  defp ascii?(value), do: Enum.all?(:binary.bin_to_list(value), &(&1 < 128))

  defp valid_dns_label?(label) do
    byte_size(label) in 1..63 and
      Regex.match?(~r/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, label)
  end
end
