defmodule FormDelegate.Router do
  use FormDelegate.Web, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug Guardian.Plug.VerifyHeader, realm: "Bearer"
    plug Guardian.Plug.LoadResource
  end

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  scope "/api", FormDelegate do
    pipe_through :api

    post "/requests/:id", RequestController, :process_request

    get "/forms", FormController, :index

    get "/integrations", IntegrationController, :index

    get "/messages", MessageController, :index
    get "/messages/:id", MessageController, :show
    post "/messages", MessageController, :create
    delete "/messages/:id", MessageController, :delete

    resources "/admin/accounts", Admin.AccountController

    post "/sessions", SessionController, :create
    delete "/sessions", SessionController, :delete
  end

  scope "/", FormDelegate do
    pipe_through [:browser]

    get "/*path", PageController, :index
  end
end
