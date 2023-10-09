defmodule FormDelegateWeb.Router do
  use FormDelegateWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :browser_and_api do
    plug :accepts, ["html", "json"]
  end

  pipeline :check_authenticated do
    @claims %{typ: "access"}

    plug Guardian.Plug.Pipeline,
      otp_app: :form_delegate,
      module: FormDelegateWeb.Guardian,
      error_handler: FormDelegateWeb.AuthErrorHandler

    plug Guardian.Plug.VerifySession, claims: @claims
    plug Guardian.Plug.VerifyHeader, claims: @claims, scheme: "Bearer"

    plug Guardian.Plug.LoadResource, allow_blank: true
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
    pipe_through [:browser_and_api]

    post "/submissions/:form_id", SubmissionController, :create, as: :submission
  end

  # Unathenticated routes
  scope "/v1", FormDelegateWeb do
    pipe_through :api

    resources "/sessions", SessionController,
      only: [:create, :delete],
      singleton: true

    resources "/users", UserController, only: [:create]

    post "/users/confirm", UserConfirmationController, :create, as: :user_confirmation
    get "/users/confirm", UserConfirmationController, :confirm, as: :user_confirmation

    post "/users/reset-password", ResetPasswordController, :create, as: :reset_password
    put "/users/reset-password", ResetPasswordController, :update, as: :reset_password
    patch "/users/reset-password", ResetPasswordController, :update, as: :reset_password

    post "/validations/email", ValidationController, :email, as: :email_validation
  end

  # Authenticated routes
  scope "/v1", FormDelegateWeb do
    pipe_through [:api, :check_authenticated, :ensure_authenticated, :load_user]

    post "/stripe/checkout-sessions", StripeController, :create_checkout_session,
      as: :stripe_checkout_session

    # stripe details of current sub?

    get "/stripe/portal", StripeController, :create_portal, as: :stripe_portal

    resources "/forms", FormController, except: [:edit, :new]

    scope "/submissions" do
      # @TODO: Refactor and move to different namespace
      get "/recent_activity", SubmissionController, :recent_activity,
        as: :submission_recent_activity

      patch "/:id/ham", SubmissionController, :ham, as: :submission_ham
      put "/:id/ham", SubmissionController, :ham, as: :submission_ham
      patch "/:id/spam", SubmissionController, :spam, as: :submission_spam
      put "/:id/spam", SubmissionController, :spam, as: :submission_spam
    end

    resources "/submissions", SubmissionController, only: [:index, :show]

    resources "/users", UserController, except: [:create, :edit, :new]

    resources "/plans", PlanController, except: [:edit, :new]
  end
end
