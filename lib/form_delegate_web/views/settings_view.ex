defmodule FormDelegateWeb.SettingsView do
  use FormDelegateWeb, :view

  def render("settings.json", %{settings: settings}) do
    %{
      id: settings.id,
      api_key: settings.api_key,
      email: settings.email
    }
  end
end
