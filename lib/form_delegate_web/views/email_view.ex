defmodule FormDelegateWeb.EmailView do
  use FormDelegateWeb, :view

  @unsupported_value "[unsupported value]"

  def format_submission_value(value) when is_binary(value), do: value
  def format_submission_value(nil), do: ""

  def format_submission_value(value)
      when is_integer(value) or is_float(value) or is_boolean(value),
      do: to_string(value)

  def format_submission_value(value) when is_map(value) or is_list(value) do
    case Jason.encode(value) do
      {:ok, encoded_value} -> encoded_value
      {:error, _reason} -> @unsupported_value
    end
  end

  def format_submission_value(_value), do: @unsupported_value
end
