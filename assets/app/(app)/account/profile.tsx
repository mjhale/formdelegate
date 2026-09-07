'use client';

import { useActionState, useState, useTransition } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';

import { updatePasswordAction, updateUserAction } from './actions';

import AccountNav from '../_components/accountNav';
import { Button as ActionButton, buttonClasses } from '../_components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../_components/card';
import { Input } from '../_components/input';

const initialUserState = { message: null, errors: {} };
const initialPasswordState = { message: null, errors: {} };

export default function AccountProfile({ user }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userState, userFormAction] = useActionState(
    updateUserAction,
    initialUserState
  );
  const [passwordState, passwordFormAction] = useActionState(
    updatePasswordAction,
    initialPasswordState
  );
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <header className="mb-[18px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Personal settings
          </p>
          <h1>Account</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Manage your profile and sign-in details.
          </p>
        </div>
        <div className="flex flex-[0_0_auto] gap-[9px] max-lg:w-full max-lg:[&>a]:flex-1 max-lg:[&>button]:flex-1">
          {!isEditingProfile ? (
            <ActionButton
              onClick={() => setIsEditingProfile(true)}
              type="button"
            >
              Edit profile
            </ActionButton>
          ) : (
            <>
              <ActionButton
                onClick={() => setIsEditingProfile(false)}
                type="reset"
                form="account"
              >
                Cancel
              </ActionButton>
              <ActionButton
                aria-disabled={isPending}
                variant={'primary'}
                form="account"
                type="submit"
              >
                Save changes
              </ActionButton>
            </>
          )}
        </div>
      </header>

      <AccountNav />

      {userState?.message ? (
        <p
          aria-live="polite"
          className={`[margin:0_0_14px] py-2.5 px-3 rounded-[8px] text-xs ${
            userState.errors && Object.keys(userState.errors).length > 0
              ? 'border border-[#efc2bc] bg-brand-soft text-brand-dark'
              : 'border border-[#c9e5d9] bg-[#eaf7f1] text-[#24725a]'
          }`}
        >
          {userState.message}
        </p>
      ) : null}

      <div className="grid gap-[18px]">
        <form
          action={async (formData: FormData) => {
            startTransition(() => userFormAction(formData));
          }}
          id="account"
        >
          <input name="id" type="hidden" defaultValue={user.id} />

          <Card className="[&+section]:mt-[18px]">
            <CardHeader>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Basic information associated with your account.
                </CardDescription>
              </div>
            </CardHeader>

            <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
              <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
                <strong>Name</strong>
                <p>Shown to other members of your teams.</p>
              </div>
              <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
                {isEditingProfile ? (
                  <>
                    <Input
                      aria-describedby="name-error"

                      defaultValue={user.name}
                      id="name"
                      name="name"
                      type="text"
                    />
                    <FieldErrors
                      errors={userState?.errors?.name?._errors}
                      id="name-error"
                    />
                  </>
                ) : (
                  user.name || 'Not set'
                )}
              </div>
              <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
                {!isEditingProfile ? (
                  <ActionButton
                    size="small"
                    onClick={() => setIsEditingProfile(true)}
                    type="button"
                  >
                    Edit
                  </ActionButton>
                ) : null}
              </div>
            </div>

            <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
              <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
                <strong>Email address</strong>
                <p>Used for sign-in and account notifications.</p>
              </div>
              <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
                {isEditingProfile ? (
                  <>
                    <Input
                      aria-describedby="email-error"

                      defaultValue={user.email}
                      id="email"
                      name="email"
                      type="email"
                    />
                    <FieldErrors
                      errors={userState?.errors?.email?._errors}
                      id="email-error"
                    />
                  </>
                ) : (
                  user.email
                )}
              </div>
              <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
                {!isEditingProfile ? (
                  <ActionButton
                    size="small"
                    onClick={() => setIsEditingProfile(true)}
                    type="button"
                  >
                    Change
                  </ActionButton>
                ) : null}
              </div>
            </div>
          </Card>
        </form>

        <Card className="[&+section]:mt-[18px]">
          <CardHeader>
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Review authentication and account access.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="grid min-h-[82px] grid-cols-[minmax(210px,_0.9fr)_minmax(260px,_1.35fr)_auto] items-center gap-[26px] border-t border-t-[#e5ded3] px-[19px] py-[17px] first:border-t-0 max-[820px]:grid-cols-[minmax(0,_1fr)_auto] max-[820px]:gap-[10px_16px]">
            <div className="[&_p]:m-0 [&_p]:text-[11px] [&_p]:text-muted [&_strong]:mb-[3px] [&_strong]:block [&_strong]:text-xs [&_strong]:font-[690] [&_strong]:text-[#33343a]">
              <strong>Password</strong>
              <p>Update the password used to sign in to Form Delegate.</p>
            </div>
            <div className="min-w-0 text-xs text-[#46474d] max-[820px]:col-span-full max-[820px]:row-start-2 [&_code]:block [&_code]:overflow-hidden [&_code]:text-ellipsis [&_code]:whitespace-nowrap [&_code]:rounded-[7px] [&_code]:border [&_code]:border-[#e5ded3] [&_code]:bg-[#f7f3eb] [&_code]:px-2.5 [&_code]:py-2 [&_code]:font-mono [&_code]:text-[10px] [&_code]:text-[#4a4140]">
              ••••••••••••
            </div>
            <div className="[justify-self:end] max-[820px]:col-start-2 max-[820px]:row-start-1">
              <PasswordDialog
                isPending={isPending}
                passwordFormAction={passwordFormAction}
                passwordState={passwordState}
                startTransition={startTransition}
                userId={user.id}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function PasswordDialog({
  isPending,
  passwordFormAction,
  passwordState,
  startTransition,
  userId,
}) {
  return (
    <DialogTrigger>
      <Button className={buttonClasses({ size: 'small' })}>Update</Button>
      <ModalOverlay className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(40,_24,_19,_0.5)] p-[18px] [backdrop-filter:blur(4px)]">
        <Modal
          className="max-h-[calc(100vh_-_36px)] w-[min(100%,_520px)] rounded-[14px] border border-[#e5ded3] bg-surface shadow-[0_24px_70px_rgba(54,_33,_22,_0.2)] [overflow:auto]"
          isDismissable
        >
          <Dialog className="outline-none">
            {({ close }) => (
              <form
                action={async (formData: FormData) => {
                  startTransition(() => passwordFormAction(formData));
                }}
              >
                <div className="pb-3 pl-5 pr-5 pt-[18px] [&_h2]:m-0 [&_h2]:text-[17px]">
                  <Heading slot="title">Change password</Heading>
                </div>
                <div className="pb-[18px] pl-5 pr-5 pt-2.5">
                  <input name="id" type="hidden" defaultValue={userId} />
                  <div className="grid gap-3.5">
                    <PasswordField
                      errors={passwordState?.errors?.current_password?._errors}
                      label="Current password"
                      name="current_password"
                      autoComplete="current-password"
                    />
                    <PasswordField
                      errors={passwordState?.errors?.password?._errors}
                      label="New password"
                      name="password"
                      autoComplete="new-password"
                    />
                    <PasswordField
                      errors={
                        passwordState?.errors?.password_confirmation?._errors
                      }
                      label="Confirm password"
                      name="password_confirmation"
                      autoComplete="new-password"
                    />
                  </div>
                  {passwordState?.message ? (
                    <p
                      className="mb-0 ml-0 mr-0 mt-1.5 text-[11px] text-brand-deep"
                      aria-live="polite"
                    >
                      {passwordState.message}
                    </p>
                  ) : null}
                </div>
                <footer className="flex justify-end gap-2 border-t border-t-[#e5ded3] bg-[rgba(247,_240,_226,_0.35)] px-5 py-3.5">
                  <Button
                    className={buttonClasses({})}
                    onPress={close}
                    type="reset"
                  >
                    Cancel
                  </Button>
                  <ActionButton
                    variant={'primary'}
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? 'Updating…' : 'Change password'}
                  </ActionButton>
                </footer>
              </form>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

function PasswordField({
  autoComplete,
  errors,
  label,
  name,
}: {
  autoComplete: string;
  errors?: string[];
  label: string;
  name: string;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[11px] font-[650] text-[#45464c]"
        htmlFor={name}
      >
        {label}
      </label>
      <Input
        aria-describedby={`${name}-error`}
        autoComplete={autoComplete}

        id={name}
        name={name}
        type="password"
      />
      <FieldErrors errors={errors} id={`${name}-error`} />
    </div>
  );
}

function FieldErrors({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;

  return (
    <div
      aria-live="polite"
      className="mb-0 ml-0 mr-0 mt-1.5 text-[11px] text-brand-deep"
      id={id}
    >
      {errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
}
