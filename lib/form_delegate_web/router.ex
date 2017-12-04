defmodule FormDelegateWeb.Router do
  use FormDelegateWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :check_authenticated do
    @claims %{typ: "access"}

    plug Guardian.Plug.Pipeline, otp_app: :form_delegate,
      module: FormDelegateWeb.Guardian,
      error_handler: FormDelegateWeb.AuthErrorHandler

    plug Guardian.Plug.VerifySession, claims: @claims
    plug Guardian.Plug.VerifyHeader, claims: @claims, realm: "Bearer"

    plug Guardian.Plug.LoadResource, ensure: true, allow_blank: true
  end

  pipeline :ensure_authenticated do
    plug Guardian.Plug.EnsureAuthenticated
  end

  pipeline :load_user do
    plug FormDelegateWeb.LoadUser
  end

  pipeline :ensure_admin do
    plug FormDelegateWeb.EnsureAdmin
  end

  if Mix.env == :dev do
    forward "/sent_emails", Bamboo.EmailPreviewPlug
  end

  scope "/api", FormDelegateWeb do
    pipe_through [:api, :check_authenticated]

    # non-authenticated routes
    scope "/" do
      pipe_through :load_user

      post "/requests/:id", RequestController, :process_request
      resources "/sessions", SessionController, only: [:create, :delete],
                                                singleton: true
      resources "/users", UserController, only: [:create]
    end

    # authenticated routes
    scope "/" do
      pipe_through [:ensure_authenticated, :load_user]

      resources "/forms", FormController
      get "/integrations", IntegrationController, :index
      resources "/messages", MessageController, only: [:index, :show, :create, :delete]
      get "/search/messages", SearchMessageController, :index
      get "/stats/message_activity", StatsController, :message_activity
      resources "/users", UserController, only: [:show, :update]

      scope "/admin", Admin, as: :admin do
        pipe_through :ensure_admin

        resources "/integrations", IntegrationController, only: [:index, :show, :update]
      end
    end
  end
end
