defmodule FormDelegate.Integrations.EmailProviders.Shared do
  def map_value(map, key) do
    Map.get(map, key) || Map.get(map, String.to_atom(key))
  end

  def normalize_recipients(nil), do: []

  def normalize_recipients(recipients) when is_list(recipients) do
    Enum.map(recipients, &normalize_recipient/1)
  end

  def normalize_recipients(recipient) do
    [normalize_recipient(recipient)]
  end

  def normalize_recipient({name, email}) when is_binary(email) do
    %{name: normalize_name(name), email: email}
  end

  def normalize_recipient(email) when is_binary(email) do
    %{name: nil, email: email}
  end

  def normalize_recipient(%{email: email} = recipient) when is_binary(email) do
    %{name: normalize_name(Map.get(recipient, :name)), email: email}
  end

  def normalize_recipient(%{"email" => email} = recipient) when is_binary(email) do
    %{name: normalize_name(Map.get(recipient, "name")), email: email}
  end

  def normalize_recipient(other), do: %{name: nil, email: to_string(other)}

  def format_recipient_for_header(%{name: nil, email: email}), do: email
  def format_recipient_for_header(%{name: "", email: email}), do: email
  def format_recipient_for_header(%{name: name, email: email}), do: "#{name} <#{email}>"

  def normalize_name(nil), do: nil
  def normalize_name(""), do: nil
  def normalize_name(name), do: to_string(name)
end
