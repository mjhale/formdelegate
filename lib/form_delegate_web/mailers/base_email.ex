defmodule FormDelegateWeb.Mailers.BaseEmail do
  use Bamboo.Phoenix, view: FormDelegateWeb.EmailView

  alias FormDelegateWeb.EmailView

  @spec base_email :: Bamboo.Email.t()
  def base_email do
    new_email()
    |> from({"Form Delegate", "hello@formdelegate.com"})
    |> put_layout({EmailView, :layout})
  end
end
