defmodule FormDelegateWeb.Router do
  use FormDelegateWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :check_authenticated do
    @claims %{typ: "access"}

    plug Guardian.Plug.Pipeline,
      otp_app: :form_delegate,
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

  if Mix.env() == :dev do
    forward "/sent_emails", Bamboo.SentEmailViewerPlug
  end

  scope "/v1", FormDelegateWeb do
    pipe_through :api

    post "/requests/:id", RequestController, :create

    resources "/sessions", SessionController,
      only: [:create, :delete],
      singleton: true

    resources "/users", UserController, only: [:create]
  end

  scope "/v1", FormDelegateWeb do
    pipe_through [:api, :check_authenticated, :ensure_authenticated, :load_user]

    resources "/forms", FormController, except: [:edit, :new]
    resources "/integrations", IntegrationController, except: [:create, :delete, :edit, :new]

    # @TODO: Refactor and move to different namespace
    get "/messages/recent_activity", MessageController, :recent_activity

    scope "/messages" do
      patch "/:id/ham", MessageController, :ham, as: :message_ham
      put "/:id/ham", MessageController, :ham, as: :message_ham
      patch "/:id/spam", MessageController, :spam, as: :message_spam
      put "/:id/spam", MessageController, :spam, as: :message_spam
    end

    resources "/messages", MessageController, only: [:index, :show]

    resources "/users", UserController, except: [:create, :edit, :new]
  end
end
