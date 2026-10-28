defmodule FormDelegate.Submissions.SpamClassifier do
  @moduledoc """
  Versioned, local-only heuristics. Scores are rule weights, not probabilities.
  Weak signals and incomplete inspection require review; no content is discarded.
  """
  @version "builtin-v1"
  @max_bytes 32_768
  @solicitation ~r/\b(?:buy (?:now|cheap)|guaranteed (?:profit|returns?|income)|double your (?:money|bitcoin)|claim your (?:prize|winnings)|earn money (?:fast|online)|seo (?:services|backlinks)|cheap (?:viagra|cialis))\b/u
  @credentials ~r/\b(?:send|enter|confirm|verify) (?:us |your )?(?:password|seed phrase|private key|credit card number)\b/u
  @urls ~r/(?:https?:\/\/|www\.)[^\s<>]+/u

  def classify(submission, signals \\ %{}, mode \\ :balanced) do
    {text, incomplete?} = inspectable_text(submission)
    urls = length(Regex.scan(@urls, text))

    reasons =
      []
      |> add(incomplete?, "inspection_limit", 0)
      |> add(text == "", "empty_content", 0)
      |> add(Regex.match?(@solicitation, text), "commercial_solicitation", 3)
      |> add(Regex.match?(@credentials, text), "credential_request", 3)
      |> add(urls >= 4, "many_links", 3)
      |> add(Map.get(signals, :duplicates, 0) >= 2, "repeated_content", 0)
      |> add(Map.get(signals, :recent_from_ip, 0) >= 10, "submission_burst", 0)

    score = Enum.reduce(reasons, 0, &(&1.weight + &2))

    status = decision(mode, incomplete?, score, reasons)

    reasons =
      case mode do
        :off -> [%{code: "filter_disabled", weight: 0}]
        :review_all -> reasons ++ [%{code: "review_all", weight: 0}]
        _ -> reasons
      end

    %{
      status: status,
      assessment: %{
        "engine" => @version,
        "decision" => to_string(status),
        "mode" => to_string(mode),
        "score" => if(mode == :off, do: 0, else: score),
        "reasons" => Enum.map(reasons, & &1.code)
      }
    }
  end

  defp decision(:off, _, _, _), do: :accepted
  defp decision(:review_all, _, _, _), do: :review
  defp decision(_, true, _, _), do: :review
  defp decision(_, _, score, _) when score >= 6, do: :spam
  defp decision(_, _, _, []), do: :accepted
  defp decision(_, _, _, _), do: :review

  # Hash the complete canonical content, not just the inspected prefix. Field names
  # are included so structurally different forms do not collapse into one message.
  def fingerprint(submission) do
    fields = submission.fields || %{}

    canonical =
      fields |> Enum.map(fn {k, v} -> {to_string(k), fingerprint_value(v)} end) |> Enum.sort()

    :crypto.hash(
      :sha256,
      :erlang.term_to_binary(
        {fingerprint_value(submission.sender), fingerprint_value(submission.body), canonical}
      )
    )
    |> Base.encode16(case: :lower)
  end

  defp inspectable_text(submission) do
    # Intake fields are authoritative; database preview defaults ("Anonymous")
    # must not turn a blank submission into legitimate content.
    fields = submission.fields || %{}

    values =
      if map_size(fields) > 0, do: Map.values(fields), else: [submission.body, submission.sender]

    raw_bytes =
      Enum.reduce(values, 0, fn value, sum ->
        sum + if(is_binary(value), do: byte_size(value), else: 0)
      end)

    # Never feed unbounded strings to Unicode normalization or regexes.
    values = Enum.filter(values, &(is_binary(&1) and byte_size(&1) <= @max_bytes))

    if raw_bytes > @max_bytes do
      {"", true}
    else
      {values |> Enum.map(&normalize/1) |> Enum.uniq() |> Enum.sort() |> Enum.join("\n"), false}
    end
  end

  defp fingerprint_value(value) when is_binary(value) and byte_size(value) > @max_bytes,
    do: {:oversized, :crypto.hash(:sha256, value)}

  defp fingerprint_value(value), do: normalize(value)

  defp normalize(value) when is_binary(value) do
    value
    |> String.normalize(:nfkc)
    |> String.downcase()
    |> String.replace(~r/[\x{200B}-\x{200D}\x{FEFF}]/u, "")
    |> String.replace(~r/\s+/u, " ")
    |> String.trim()
  end

  defp normalize(_), do: ""
  defp add(reasons, true, code, weight), do: reasons ++ [%{code: code, weight: weight}]
  defp add(reasons, false, _, _), do: reasons
end
