defmodule FormDelegateWeb.ErrorViewTest do
  use FormDelegateWeb.ConnCase, async: true

  # Bring render/3 and render_to_string/3 for testing custom views
  import Phoenix.View

  test "renders 404.json" do
    assert render(FormDelegateWeb.ErrorView, "404.json", []) ==
             %{error: %{code: 404, type: "PAGE_NOT_FOUND"}}
  end

  test "renders typed and generic 403.json responses" do
    assert render(FormDelegateWeb.ErrorView, "403.json", %{type: "SOURCE_NOT_ALLOWED"}) ==
             %{error: %{code: 403, type: "SOURCE_NOT_ALLOWED"}}

    assert render(FormDelegateWeb.ErrorView, "403.json", []) ==
             %{error: %{code: 403, type: "FORBIDDEN"}}
  end

  test "render 500.json" do
    assert render(FormDelegateWeb.ErrorView, "500.json", []) ==
             %{error: %{code: 500, type: "INTERNAL_SERVER_ERROR"}}
  end

  test "render any other" do
    assert render(FormDelegateWeb.ErrorView, "505.json", []) ==
             %{error: %{code: 500, type: "INTERNAL_SERVER_ERROR"}}
  end
end
