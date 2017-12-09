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

  if Mix.env == :dev do
    forward "/sent_emails", Bamboo.EmailPreviewPlug
  end

  scope "/v1", FormDelegateWeb do
    pipe_through :api

    post "/requests/:id", RequestController, :process_request
    resources "/sessions", SessionController, only: [:create, :delete],
                                              singleton: true
  end

  scope "/v1", FormDelegateWeb do
    pipe_through [:api, :check_authenticated, :ensure_authenticated, :load_user]

    resources "/forms", FormController
    resources "/integrations", IntegrationController, only: [:index, :show, :update]

    # @TODO: Move to different namespace
    get "/messages/recent_activity", MessageController, :recent_activity

    resources "/messages", MessageController, only: [:index, :show]
    resources "/users", UserController
  end
end
