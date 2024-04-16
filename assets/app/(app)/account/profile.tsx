'use client';

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';

import { updateUserAction, updatePasswordAction } from './actions';

import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';

const initialUserState = {
  message: null,
  errors: {},
};

const initialPasswordState = {
  message: null,
  errors: {},
};

export default function AccountProfile({ user }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userState, userFormAction] = useFormState(
    updateUserAction,
    initialUserState
  );
  const [passwordState, passwordFormAction] = useFormState(
    updatePasswordAction,
    initialPasswordState
  );

  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl lowercase tracking-wide font-semibold">
          Account Profile
        </h1>

        <div>
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="reset"
                form="account"
                className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
                onClick={() => {
                  setIsEditingProfile(false);
                }}
                value="Cancel"
              />
              <input
                type="submit"
                form="account"
                aria-disabled={isPending}
                className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
                value="Save"
              />
            </div>
          )}
        </div>
      </div>

      <hr className="bg-slate-100 mb-5" />

      {!isEditingProfile ? (
        <>
          <div className="flex items-center h-14">
            <div className="flex-0 w-1/4 font-semibold">Email</div>
            <div className="flex-1">{user.email}</div>
          </div>

          <div className="flex items-center h-14">
            <div className="flex-0 w-1/4 font-semibold">Name</div>
            <div className="flex-1">{user.name}</div>
          </div>

          <div className="flex items-center h-14">
            <div className="flex-0 w-1/4 font-semibold">Password</div>
            <div className="flex-1">••••••</div>
          </div>
        </>
      ) : (
        <>
          <form
            id="account"
            action={async (formData: FormData) => {
              startTransition(() => {
                userFormAction(formData);
              });
            }}
          >
            <input name="id" id="id" type="hidden" defaultValue={user.id} />

            <div className="flex items-center h-14">
              <div className="flex-0 w-1/4 font-semibold">Email</div>
              <div className="flex-1">
                <input
                  name="email"
                  id="email"
                  aria-describedby="email.error"
                  type="text"
                  className="w-full max-w-sm appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                  defaultValue={user.email}
                />
              </div>
            </div>
            {userState?.errors?.email &&
              userState?.errors.email._errors.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}

            <div className="flex items-center h-14">
              <div className="flex-0 w-1/4 font-semibold">Name</div>
              <div className="flex-1">
                <input
                  name="name"
                  id="name"
                  aria-describedby="name.error"
                  type="text"
                  className="w-full max-w-sm appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                  defaultValue={user.name}
                />
              </div>
            </div>
            {userState?.errors?.name &&
              userState?.errors.name._errors.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}

            <p aria-live="polite" className="sr-only">
              {userState?.message && userState.message}
            </p>
          </form>

          <div className="flex items-center h-14">
            <div className="flex-0 w-1/4 font-semibold">Password</div>
            <div className="flex-1">
              <DialogTrigger>
                <Button className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer">
                  Change password
                </Button>
                <ModalOverlay className="h-[--visual-viewport-height] fixed inset-x-0 top-0 z-50 bg-black/60 backdrop-blur-sm transition-all entering:duration-75 entering:animate-in entering:fade-in exiting:animate-in exiting:fade-in exiting:direction-reverse">
                  <Modal
                    isDismissable
                    className="my-16 max-w-[32rem] mx-auto w-full flex-col rounded bg-white outline-none entering:animate-in entering:zoom-in-95 exiting:animate-in exiting:zoom-in-95 exiting:direction-reverse"
                  >
                    <Dialog className="relative flex h-full flex-col outline-none">
                      {({ close }) => (
                        <form
                          action={async (formData: FormData) => {
                            startTransition(() => {
                              passwordFormAction(formData);
                            });
                          }}
                        >
                          <Heading
                            slot="title"
                            className="shrink-0 px-6 py-4 text-xl font-semibold text-black"
                          >
                            Change password
                          </Heading>
                          <div className="flex-1 px-6 py-2">
                            <input
                              name="id"
                              id="id"
                              type="hidden"
                              defaultValue={user.id}
                            />

                            <div className="flex items-center h-14">
                              <div className="flex-0 w-2/5 font-semibold">
                                Old password
                              </div>
                              <div className="flex-1">
                                <input
                                  name="old_password"
                                  id="old_password"
                                  aria-describedby="old_password.error"
                                  type="text"
                                  className="w-full max-w-sm appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                                />
                              </div>
                            </div>
                            {passwordState?.errors?.oldPassword &&
                              passwordState?.errors.oldPassword._errors.map(
                                (error: string) => (
                                  <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                  >
                                    {error}
                                  </p>
                                )
                              )}

                            <div className="flex items-center h-14">
                              <div className="flex-0 w-2/5 font-semibold">
                                New password
                              </div>
                              <div className="flex-1">
                                <input
                                  name="new_password"
                                  id="new_password"
                                  aria-describedby="new_password.error"
                                  type="text"
                                  className="w-full max-w-sm appearance-none shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2"
                                />
                              </div>
                            </div>

                            {passwordState?.errors?.newPassword &&
                              passwordState?.errors.newPassword._errors.map(
                                (error: string) => (
                                  <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                  >
                                    {error}
                                  </p>
                                )
                              )}

                            <p aria-live="polite" className="sr-only">
                              {passwordState?.message && passwordState.message}
                            </p>
                          </div>

                          <footer className="px-6 py-4 flex justify-between gap-4">
                            <input
                              type="submit"
                              className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
                              value="Change password"
                            />
                            <Button
                              type="reset"
                              onPress={close}
                              className="inline-block px-2 py-1 text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
                            >
                              Cancel
                            </Button>
                          </footer>
                        </form>
                      )}
                    </Dialog>
                  </Modal>
                </ModalOverlay>
              </DialogTrigger>
            </div>
          </div>
        </>
      )}
    </>
  );
}
