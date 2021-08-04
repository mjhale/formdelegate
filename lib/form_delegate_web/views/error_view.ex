defmodule FormDelegateWeb.ErrorView do
  use FormDelegateWeb, :view

  def render("400.json", %{type: type}) do
    %{
      error: %{
        code: 400,
        type: type
      }
    }
  end

  def render("400.json", _) do
    %{
      error: %{
        code: 400,
        type: "BAD_REQUEST"
      }
    }
  end

  def render("401.json", %{type: type}) do
    %{
      error: %{
        code: 401,
        type: type
      }
    }
  end

  def render("401.json", _assigns) do
    %{
      error: %{
        code: 401,
        type: "LOGIN_REQUIRED"
      }
    }
  end

  def render("403.json", _assigns) do
    %{
      error: %{
        code: 403,
        type: "FORBIDDEN"
      }
    }
  end

  def render("404.json", _assigns) do
    %{
      error: %{
        code: 404,
        type: "PAGE_NOT_FOUND"
      }
    }
  end

  def render("500.json", _assigns) do
    %{
      error: %{
        code: 500,
        type: "INTERNAL_SERVER_ERROR"
      }
    }
  end

  # In case no render clause matches or no
  # template is found, let's render it as 500
  def template_not_found(_template, assigns) do
    render("500.json", assigns)
  end
end
