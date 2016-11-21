import React from 'react';

export const IntegrationList = ({ integrations, isFetching }) => {
  if (isFetching) {
    return (
      <p>Loading integrations...</p>
    );
  }

  return (
    <div className="integrations">
      <p>
        Integrations trigger with each message you receive. Looking for something
        that we currently do not offer? Let us know.
      </p>
      <ul>
        {integrations.map((integration) => (
            <li key={integration.id}>
              <div className="type">{integration.type}</div>
            </li>
        ))}
      </ul>
    </div>
  );
};
