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

  pipeline :admin_required do
    plug FormDelegate.CheckAdmin
  end

  if Mix.env == :dev do
    forward "/sent_emails", Bamboo.EmailPreviewPlug
  end

  scope "/api", FormDelegate do
    pipe_through :api

    resources "/accounts", AccountController, only: [:create, :show, :update]
    resources "/forms", FormController
    get "/stats/message_activity", StatsController, :message_activity
    get "/integrations", IntegrationController, :index
    resources "/messages", MessageController, only: [:index, :show, :create, :delete]
    post "/requests/:id", RequestController, :process_request
    get "/search/messages", SearchMessageController, :index
    resources "/sessions", SessionController, only: [:create, :delete]

    scope "/admin", Admin, as: :admin do
      pipe_through :admin_required

      resources "/accounts", AccountController
    end
  end

  scope "/", FormDelegate do
    pipe_through :browser

    get "/*path", PageController, :index
  end
end
