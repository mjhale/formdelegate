export default async function FaqPage() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <h1 className="text-3xl lowercase tracking-wide font-semibold">
            Frequently Asked Questions
          </h1>

          <div className="">
            <h2 className="text-2xl">How does it work?</h2>
            <p>
              Code an HTML form into any page and let Form Delegate handle the
              rest. From data retention to file storage and email notifications,
              Form Delegate takes the complexities out of form handling. Just
              point your form's action attribute to our service.
            </p>
          </div>

          <div className="">
            <h2 className="text-2xl">
              Is this project ready for production usage?
            </h2>
            <p>
              No. This project is still in early development. At this stage,
              Form Delegate does not guarantee data integrity nor can it make
              any guarantees regarding service uptime.
            </p>
          </div>

          <div className="">
            <h2 className="text-2xl">What are the free tier limitations?</h2>
            <p>
              The free tier service is limited to a maximum of 100 submissions
              per month and 1 gigabyte of total file storage. There is no cap to
              the number of form endpoints that can be created.
            </p>
          </div>

          <div className="">
            <h2 className="text-2xl">
              Are forms with file input fields allowed?
            </h2>
            <p>
              Yes, Form Delegate supports file uploads which are securely
              accessible through our service.
            </p>
          </div>

          <div className="">
            <h2 className="text-2xl">How do integrations work?</h2>
            <p>
              Form Delegate supports integrations with a number of third-party
              services such as Zapier and Ifttt. To integrate with a service,
              click the "Add Integration" button on the form's settings page.
            </p>
          </div>

          <div className="">
            <h2 className="text-2xl">What are domain allow lists?</h2>
            <p>
              If you wish to restrict form submissions to specific domains, you
              can do so by adding them to the form's allow list.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
