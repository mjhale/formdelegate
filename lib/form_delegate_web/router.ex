defmodule FormDelegateWeb.Router do
  use FormDelegateWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :authorized do
    @claims %{typ: "access"}

    plug Guardian.Plug.Pipeline, otp_app: :form_delegate,
      module: FormDelegateWeb.Guardian,
      error_handler: FormDelegateWeb.AuthErrorHandler

    plug Guardian.Plug.VerifySession, claims: @claims
    plug Guardian.Plug.VerifyHeader, claims: @claims, realm: "Bearer"
    plug Guardian.Plug.EnsureAuthenticated
    plug Guardian.Plug.LoadResource, ensure: true
  end

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :admin do
    plug FormDelegateWeb.CheckAdmin
  end

  if Mix.env == :dev do
    forward "/sent_emails", Bamboo.EmailPreviewPlug
  end

  scope "/api", FormDelegateWeb do
    pipe_through :api

    scope "/" do
      post "/requests/:id", RequestController, :process_request
      resources "/sessions", SessionController, only: [:create]
      resources "/users", UserController, only: [:create]
    end

    scope "/" do
      pipe_through :authorized

      resources "/forms", FormController
      get "/integrations", IntegrationController, :index
      resources "/messages", MessageController, only: [:index, :show, :create, :delete]
      get "/search/messages", SearchMessageController, :index
      resources "/sessions", SessionController, only: [:delete]
      get "/stats/message_activity", StatsController, :message_activity
      resources "/users", UserController, only: [:show, :update]
    end

    scope "/admin", Admin, as: :admin do
      pipe_through [:authorized, :admin]

      resources "/users", UserController
      resources "/integrations", IntegrationController, only: [:index, :show, :update]
    end
  end

  scope "/", FormDelegateWeb do
    pipe_through :browser

    get "/*path", PageController, :index
  end
end
