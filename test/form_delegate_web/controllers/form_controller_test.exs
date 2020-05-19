defmodule FormDelegateWeb.FormControllerTest do
  use FormDelegateWeb.ConnCase

  alias FormDelegateWeb.Router.Helpers, as: Routes

  @valid_attrs %{form: "Contact Form"}
  @update_attrs %{form: "Report Form", host: "example.com"}
  @invalid_attrs %{form: nil}

  setup %{conn: conn, user: user} do
    jwt =
      case FormDelegateWeb.Guardian.encode_and_sign(user) do
        {:ok, jwt, _full_claims} ->
          jwt

        _ ->
          nil
      end

    {:ok, conn: put_req_header(conn, "accept", "application/json"), jwt: jwt}
  end

  describe "index/2" do
    @tag :as_inserted_user
    test "Responds with with all user forms", %{conn: conn, jwt: jwt, user: user} do
      form = FormDelegate.Factory.insert(:form, user: user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :index))
        |> json_response(200)

      expected = %{
        "data" => [
          %{
            "form" => form.form,
            "form_integrations" => [],
            "host" => nil,
            "id" => form.id,
            "inserted_at" => NaiveDateTime.to_iso8601(form.inserted_at),
            "submission_count" => 0,
            "updated_at" => NaiveDateTime.to_iso8601(form.updated_at),
            "verified" => false
          }
        ]
      }

      assert response == expected
    end
  end

  describe "create/2" do
    @tag :as_inserted_user
    test "Creates, and responds with a newly created form if attributes are valid", %{
      conn: conn,
      jwt: jwt
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_path(conn, :create), form: @valid_attrs)
        |> json_response(201)

      assert response["data"]["form"] == "Contact Form"
      assert response["data"]["host"] == nil
      assert response["data"]["submission_count"] == 0
      assert response["data"]["verified"] == false
    end

    @tag :as_inserted_user
    test "Returns an error and does not create a form if attributes are invalid", %{
      conn: conn,
      jwt: jwt
    } do
      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> post(Routes.form_path(conn, :create), form: @invalid_attrs)
        |> json_response(422)

      expected = %{"errors" => %{"form" => ["can't be blank"]}}

      assert response == expected
    end
  end

  @tag :as_inserted_user
  describe "show/2" do
    test "Responds with form info if the form is found", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      form = FormDelegate.Factory.insert(:form, user: user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :show, form.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "form" => form.form,
          "form_integrations" => [],
          "host" => nil,
          "id" => form.id,
          "inserted_at" => NaiveDateTime.to_iso8601(form.inserted_at),
          "submission_count" => 0,
          "updated_at" => NaiveDateTime.to_iso8601(form.updated_at),
          "verified" => false
        }
      }

      assert response == expected
    end

    @tag :as_inserted_user
    test "Responds with an error indicating form not found", %{
      conn: conn,
      jwt: jwt
    } do
      assert_error_sent :not_found, fn ->
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :show, "55555555-5555-5555-5555-555555555555"))
      end
    end
  end

  describe "update/2" do
    @tag :as_inserted_user
    test "Edits, and responds with the form if attributes are valid", %{
      conn: conn,
      jwt: jwt,
      user: user
    } do
      form = FormDelegate.Factory.insert(:form, user: user)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> put(Routes.form_path(conn, :update, form.id), form: @update_attrs)
        |> json_response(200)

      assert response["data"]["form"] == "Report Form"
      assert response["data"]["host"] == "example.com"
      assert response["data"]["submission_count"] == 0
      assert response["data"]["verified"] == false
    end

    @tag :as_inserted_user
    test "Returns an error and does not edit the form if attributes are invalid",
         %{
           conn: conn,
           jwt: jwt,
           user: user
         } do
      form = FormDelegate.Factory.insert(:form, user: user)

      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> put(Routes.form_path(conn, :update, form.id), form: @invalid_attrs)
      |> json_response(:unprocessable_entity)
    end
  end

  describe "delete/3" do
    @tag :as_inserted_user
    test "Deletes, and returns a 404 if the form was deleted",
         %{
           conn: conn,
           jwt: jwt,
           user: user
         } do
      form = FormDelegate.Factory.insert(:form, user: user)

      conn
      |> put_req_header("authorization", "bearer: " <> jwt)
      |> delete(Routes.form_path(conn, :delete, form.id))
      |> response(204)

      assert_error_sent 404, fn ->
        conn
        |> put_req_header("authorization", "bearer: " <> jwt)
        |> get(Routes.form_path(conn, :show, form.id))
      end
    end

    test "Returns an error and does not delete the form if other user", %{
      conn: conn
    } do
      user = FormDelegate.Factory.insert(:user)
      {:ok, user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(user)
      user_form = FormDelegate.Factory.insert(:form, user: user)

      other_user = FormDelegate.Factory.insert(:user)
      {:ok, other_user_jwt, _full_claims} = FormDelegateWeb.Guardian.encode_and_sign(other_user)

      conn
      |> put_req_header("authorization", "bearer: " <> other_user_jwt)
      |> delete(Routes.form_path(conn, :delete, user_form.id))
      |> json_response(403)

      response =
        conn
        |> put_req_header("authorization", "bearer: " <> user_jwt)
        |> get(Routes.form_path(conn, :show, user_form.id))
        |> json_response(200)

      expected = %{
        "data" => %{
          "form" => user_form.form,
          "form_integrations" => [],
          "host" => nil,
          "id" => user_form.id,
          "inserted_at" => NaiveDateTime.to_iso8601(user_form.inserted_at),
          "submission_count" => 0,
          "updated_at" => NaiveDateTime.to_iso8601(user_form.updated_at),
          "verified" => false
        }
      }

      assert response == expected
    end
  end

  describe "without logged in user" do
    test "requires user authentication on all actions", %{conn: conn} do
      Enum.each(
        [
          get(conn, Routes.form_path(conn, :index)),
          get(conn, Routes.form_path(conn, :show, "1")),
          post(conn, Routes.form_path(conn, :create, %{})),
          put(conn, Routes.form_path(conn, :update, "1", %{})),
          delete(conn, Routes.form_path(conn, :delete, "1"))
        ],
        fn conn ->
          assert json_response(conn, 401)
          assert conn.halted
        end
      )
    end
  end
end
