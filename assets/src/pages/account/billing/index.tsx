import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Flex,
  UnorderedList,
  ListItem,
  Text,
  SimpleGrid,
  Skeleton,
  Stack,
} from '@chakra-ui/react';

import Link from 'next/link';
import * as React from 'react';
import { useRouter } from 'next/navigation';

import { fetchPlans } from 'actions/plans';
import { getOrderedPlans } from 'selectors';
import getStripe from 'utils/getStripe';
import { isTokenCurrent } from 'utils';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';

import useUser from 'hooks/useUser';

const PLAN_TO_PRICE_TABLE = {
  // Professional
  '7682f531-e326-4e00-9691-99858e6f5aaa': 'price_1O9WMfEYoeWHkXvI88fWgjFu',
  // Enterprise
  '06539042-4b76-4d97-a41d-9f505c298924': 'price_1O9WPTEYoeWHkXvIKbOXCYGA',
};

const BillingOverview = () => {
  const { user, isFetching } = useUser({ redirectTo: '/login' });
  const dispatch = useAppDispatch();

  const isFetchingPlans = useAppSelector((state) => state.plans.isFetching);
  const plans = useAppSelector((state) => getOrderedPlans(state));

  const router = useRouter();

  React.useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  if (isFetching || isFetchingPlans) {
    return (
      <Stack spacing={4}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const currentSubscriptionPlanId = user.team?.subscriptions[0]?.plan?.id;

  return (
    <>
      <Flex mb={4}>
        <Link href="/account" passHref legacyBehavior>
          <Button as="a" size="sm" mr={2}>
            Account
          </Button>
        </Link>
        <Link href="/account/billing" passHref legacyBehavior>
          <Button as="a" size="sm" mr={2}>
            Billing
          </Button>
        </Link>
      </Flex>

      <Flex mb={8} flexDirection="column">
        <Heading size="lg">Billing Overview</Heading>
        <Divider mt={2} mb={4} />
        <Box>
          <Button
            onClick={() => {
              handleStripePortal(router);
            }}
            size="sm"
          >
            Manage Billing
          </Button>
        </Box>
      </Flex>
      <PlanList
        plans={plans}
        user={user}
        currentPlanId={currentSubscriptionPlanId}
      />
    </>
  );
};

async function handleStripePortal(router) {
  const stripePortalRequest = await fetch('/api/v1/stripe/portal', {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!stripePortalRequest.ok) {
    console.log('Error fetching Stripe portal URL.');
    return;
  }

  const stripePortal = await stripePortalRequest.json();

  router.push(stripePortal.url);
}

async function handleSubscribe(userEmail, teamId, planId) {
  const checkoutSessionRequest = await fetch(
    '/api/v1/stripe/checkout-sessions',
    {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: PLAN_TO_PRICE_TABLE[planId],
        customerEmail: userEmail,
      }),
    }
  );
  const checkoutSession = await checkoutSessionRequest.json();

  if (checkoutSession.statusCode === 500) {
    console.error(checkoutSession.message);
    return;
  }

  const stripe = await getStripe();

  const { error } = await stripe.redirectToCheckout({
    sessionId: checkoutSession.id,
  });

  if (error) {
    console.warn(error.message);
  }

  return;
}

function PlanList({ plans, user, currentPlanId }) {
  if (!Array.isArray(plans) || plans.length === 0) {
    return;
  }

  if (currentPlanId === undefined) {
    currentPlanId = plans.find((plan) => plan.name === 'Free').id;
  }

  const sortedPlansBySubmissions = [...plans].sort((a, b) =>
    a.limit_submissions > b.limit_submissions ? 1 : -1
  );

  return (
    <SimpleGrid
      spacing={4}
      templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
    >
      {sortedPlansBySubmissions.map((plan) => {
        return (
          <Card key={plan.id}>
            <CardHeader alignSelf="center">
              <Heading size="md">{plan.name}</Heading>
            </CardHeader>
            <CardBody>
              <UnorderedList>
                <ListItem>
                  {plan.limit_forms === 0 ? 'Unlimited' : plan.limit_forms}{' '}
                  forms
                </ListItem>
                <ListItem>
                  {plan.limit_submissions.toLocaleString()} submissions
                </ListItem>
                <ListItem>
                  {(plan.limit_storage / Math.pow(1000, 3)).toLocaleString()} GB
                  storage
                </ListItem>
              </UnorderedList>
            </CardBody>
            <CardFooter>
              <Button
                w="100%"
                onClick={() =>
                  handleSubscribe(user.email, user.team.id, plan.id)
                }
                isDisabled={plan.id === currentPlanId}
              >
                {plan.id === currentPlanId ? 'Subscribed' : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}

export async function getServerSideProps({ req }) {
  const accessToken = req.cookies?.access_token;
  const isTokenValid = isTokenCurrent(accessToken);

  if (!isTokenValid) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default BillingOverview;
