defmodule FormDelegateWeb.ErrorViewTest do
  use FormDelegateWeb.ConnCase, async: true

  # Bring render/3 and render_to_string/3 for testing custom views
  import Phoenix.View

  test "renders 404.json" do
    assert render(FormDelegateWeb.ErrorView, "404.json", []) ==
             %{errors: %{detail: "PAGE_NOT_FOUND"}}
  end

  test "render 500.json" do
    assert render(FormDelegateWeb.ErrorView, "500.json", []) ==
             %{errors: %{detail: "INTERNAL_SERVER_ERROR"}}
  end

  test "render any other" do
    assert render(FormDelegateWeb.ErrorView, "505.json", []) ==
             %{errors: %{detail: "INTERNAL_SERVER_ERROR"}}
  end
end
