defmodule FormDelegateWeb.ErrorView do
  use FormDelegateWeb, :view

  def render("400.json", %{message: message}) do
    %{errors: %{detail: "BAD_REQUEST"}, message: message}
  end

  def render("400.json", _) do
    %{errors: %{detail: "BAD_REQUEST"}}
  end

  def render("401.json", %{message: message}) do
    %{errors: %{detail: "LOGIN_REQUIRED"}, message: message}
  end

  def render("401.json", _assigns) do
    %{errors: %{detail: "LOGIN_REQUIRED"}}
  end

  def render("403.json", _assigns) do
    %{errors: %{detail: "FORBIDDEN"}}
  end

  def render("404.json", _assigns) do
    %{errors: %{detail: "PAGE_NOT_FOUND"}}
  end

  def render("500.json", _assigns) do
    %{errors: %{detail: "INTERNAL_SERVER_ERROR"}}
  end

  # In case no render clause matches or no
  # template is found, let's render it as 500
  def template_not_found(_template, assigns) do
    render("500.json", assigns)
  end
end
