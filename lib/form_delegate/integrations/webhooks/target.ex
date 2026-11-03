defmodule FormDelegate.Integrations.Webhooks.Target do
  @moduledoc "Validates and resolves a webhook destination without trusting DNS at connect time."
  import Bitwise
  alias FormDelegate.Integrations.Webhooks.Bounded
  @test_build Mix.env() == :test
  @reserved_suffixes ~w(localhost local localdomain internal intranet home lan test invalid example onion arpa)

  def validate(url) do
    with {:ok, uri} <- parse(url) do
      Bounded.run(fn -> resolve(uri) end, 5_000)
    end
  end

  def parse(url) when is_binary(url) and byte_size(url) <= 2048 do
    with {:ok, uri} <- URI.new(url),
         true <- uri.scheme == "https" and uri.port == 443,
         true <- is_nil(uri.userinfo) and is_nil(uri.fragment),
         host when is_binary(host) <- uri.host,
         true <- valid_hostname?(host) do
      {:ok, %{uri | host: String.downcase(host)}}
    else
      _ -> {:error, :invalid_url}
    end
  end

  def parse(_), do: {:error, :invalid_url}

  defp valid_hostname?(host) do
    host = String.downcase(host)
    labels = String.split(host, ".")

    length(labels) >= 2 and byte_size(host) <= 253 and
      :inet.parse_address(String.to_charlist(host)) == {:error, :einval} and
      Enum.all?(labels, &Regex.match?(~r/\A[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\z/, &1)) and
      Regex.match?(~r/[a-z]/, List.last(labels)) and
      List.last(labels) not in @reserved_suffixes and
      not Enum.any?(
        ~w(example.com example.net example.org),
        &(host == &1 or String.ends_with?(host, "." <> &1))
      )
  end

  defp resolve(uri) do
    with {:ok, addresses} <- resolver().resolve(uri.host),
         true <- addresses != [] and Enum.all?(addresses, &public_address?/1) do
      {:ok, %{uri: uri, address: hd(addresses)}}
    else
      _ -> {:error, :unsafe_destination}
    end
  end

  if @test_build do
    defp resolver, do: Application.get_env(:form_delegate, :webhook_resolver, __MODULE__.DNS)
  else
    defp resolver, do: __MODULE__.DNS
  end

  def public_address?({_, _, _, _} = address) do
    valid_words?(address, 255) and public_ipv4?(address)
  end

  def public_address?({a, b, _, _, _, _, _, _} = address) do
    valid_words?(address, 65_535) and public_ipv6_prefix?(a, b)
  end

  def public_address?(_), do: false

  defp public_ipv4?({a, b, c, d}) do
    ip = a <<< 24 ||| b <<< 16 ||| c <<< 8 ||| d

    not Enum.any?(
      [
        {{0, 0, 0, 0}, 8},
        {{10, 0, 0, 0}, 8},
        {{100, 64, 0, 0}, 10},
        {{127, 0, 0, 0}, 8},
        {{169, 254, 0, 0}, 16},
        {{172, 16, 0, 0}, 12},
        {{192, 0, 0, 0}, 24},
        {{192, 0, 2, 0}, 24},
        {{192, 88, 99, 0}, 24},
        {{192, 168, 0, 0}, 16},
        {{198, 18, 0, 0}, 15},
        {{198, 51, 100, 0}, 24},
        {{203, 0, 113, 0}, 24},
        {{224, 0, 0, 0}, 3}
      ],
      fn {{x, y, z, w}, bits} ->
        network = x <<< 24 ||| y <<< 16 ||| z <<< 8 ||| w
        ip >>> (32 - bits) == network >>> (32 - bits)
      end
    )
  end

  # Only global unicast; deny mapped/compatible IPv4, NAT64, ULA, link local,
  # multicast, documentation, 6to4 and IETF special assignments.
  defp public_ipv6_prefix?(a, b) do
    a in 0x2000..0x3FFF and a != 0x2002 and
      not (a == 0x2001 and (b <= 0x1FF or b == 0xDB8)) and
      not (a == 0x3FFF and b <= 0x0FFF)
  end

  defp valid_words?(address, max) do
    address |> Tuple.to_list() |> Enum.all?(&(is_integer(&1) and &1 >= 0 and &1 <= max))
  end

  defmodule DNS do
    @moduledoc false
    def resolve(host) do
      results = Enum.map([:inet, :inet6], &:inet.getaddrs(String.to_charlist(host), &1))

      if Enum.all?(results, fn result ->
           match?({:ok, _}, result) or result in [{:error, :nxdomain}, {:error, :nodata}]
         end) do
        {:ok,
         Enum.flat_map(results, fn
           {:ok, ips} -> ips
           _ -> []
         end)}
      else
        {:error, :dns_failed}
      end
    end
  end
end
