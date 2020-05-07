defmodule FormDelegateWeb.FlaggedTypeView do
  use FormDelegateWeb, :view

  def render("flagged_type.json", %{flagged_type: flagged_type}) do
    %{
      type: flagged_type.type,
      description: flagged_type.description
    }
  end
end
