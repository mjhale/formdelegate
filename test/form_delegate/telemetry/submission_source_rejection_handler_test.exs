defmodule FormDelegate.Telemetry.SubmissionSourceRejectionHandlerTest do
  use ExUnit.Case, async: true

  import ExUnit.CaptureLog

  alias FormDelegate.Telemetry.SubmissionSourceRejectionHandler

  test "logs a generic rejection message without submitted content" do
    log =
      capture_log(fn ->
        SubmissionSourceRejectionHandler.handle_event(
          [:form_delegate, :submission, :source_rejected],
          %{count: 1},
          %{
            form_id: "form-id",
            team_id: "team-id",
            request_id: "request-id",
            reason: :host_mismatch,
            observed_host: "evil.example"
          },
          nil
        )
      end)

    assert log =~ "submission source rejected"
    refute log =~ "private submitted message"
  end
end
