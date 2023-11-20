import { lighten, darken } from 'polished';
import * as React from 'react';
import styled from 'styled-components';

import heroImage from '../../public/images/hero-person-at-computer.jpg';
import iconBlocker from '../../public/images/icon-blocker.svg';
import iconConnection from '../../public/images/icon-connection.svg';
import iconFolder from '../../public/images/icon-folder.svg';
import iconLock from '../../public/images/icon-lock.svg';
import { media } from 'utils/style';
import theme from 'constants/theme';
import useUser from 'hooks/useUser';

import Button from 'components/Button';
import FixedLayout from 'components/Layouts/FixedLayout';
import FluidContainer from 'components/FluidContainer';
import Image from 'next/legacy/image';
import Link from 'components/Link';

const ActionBar = styled.div`
  background-color: ${theme.mineBlack};
  color: ${theme.ghostGray};
  padding: 1rem;
  text-align: center;

  a {
    color: ${theme.navHighlightColor};
  }

  a:hover {
    color: ${theme.offWhite};
  }
`;

const Card = styled.div`
  flex: 1;
  max-width: 200px;
`;

const CardHeading = styled.h2`
  align-items: center;
  display: flex;
  font-size: 1.45rem;
  margin: 0;
`;

const CardIcon = styled.span`
  display: inline-flex;
  margin: ${(props) => (props.margin ? props.margin : '0 0.5rem 0 0')};
`;

const Cards = styled.div`
  background-color: ${theme.offWhite};
  padding: 1rem 0;

  /* FluidContainer */
  & > div {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  /* Card */
  & > div > div:not(:last-child) {
    margin-right: 0;
    min-width: 125px;

    ${media.md`
      margin-right: 1.5rem;
    `};
  }

  /* Card text */
  & > div > div > p {
    font-size: 0.9rem;
    line-height: 1.6rem;
    margin: 1rem 0;
    padding: 0;
    outline: 0;
  }
`;

const Code = styled.code`
  background-color: ${theme.offWhite};
  border-radius: 0.05rem;
  display: block;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  overflow-wrap: break-word;
  padding: 1rem;
`;

const CodeExampleContainer = styled.div`
  background-color: #fff0ef;
  padding: 1rem 0;
`;

const CodeHighlight = styled.span`
  background-color: ${lighten(0.1, theme.seaPink)};
  border-radius: 0.2rem;
  padding: 0 0.25rem;
`;

const CodeTab = styled.div`
  margin-left: 1rem;
`;

const Heading = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
`;

const Hero = styled.div`
  align-items: center;
  box-shadow: inset 0 0 0 1000px rgba(50, 43, 40, 0.55);
  display: flex;
  justify-content: center;
  min-height: 275px;
  position: relative;

  ${media.md`
    min-height: 400px;
  `};
`;

const HeroWrap = styled.div`
  overflow: hidden;
  position: fixed;
  height: 75vw;
  width: 100vw;
  z-index: -1;

  ${media.md`
    height: 60vw;
  `}
`;

const HeroText = styled.div`
  margin: 0;
  font-size: 2rem;
  line-height: 1.5rem;
  text-align: center;
  text-shadow: 1px 1px 1px #3c5c5e;
`;

const HeroAction = styled.div`
  margin-top: 1.25rem;
`;

const HeroHeading = styled.h1`
  color: ${theme.offWhite};
  font-family: 'Lato', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-top: 2.3rem;
  text-shadow: ${theme.mineBlack} 1px 0 5px;
`;

const HeroMessage = styled.div`
  color: ${darken(0.1, theme.offWhite)};
  margin-top: 0.5rem;
  text-shadow: ${theme.mineBlack} 1px 0 5px;
`;

const Features = styled.div`
  background-color: ${theme.cinderella};
  padding: 1rem 0;
`;

const FeaturesList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;

  li {
    display: inline-block;
    flex: 0 0 auto;
    font-style: italic;
    list-style: none;
    padding: 0 0 1rem 0;
  }

  li:before {
    background-color: ${theme.carnation};
    content: '';
    float: left;
    height: 3px;
    margin: 0.45rem 1rem 0 0;
    width: 15px;
  }
`;

const Subheading = styled.h3`
  font-size: 1.3rem;
  margin: 0 0 1.25rem 0;
`;

const SubheadingMarginless = styled(Subheading)`
  margin: 0;
`;

const Index = () => {
  // const { user, isFetching } = useUser({
  //   redirectIfFound: true,
  //   redirectTo: '/dashboard',
  // });
  const user = null;
  const isFetching = false;

  if (!user && isFetching) {
    return null;
  }

  return (
    <React.Fragment>
      <Hero>
        <HeroWrap>
          <Image
            alt="Person using computer at desk"
            src={heroImage}
            layout="fill"
            objectFit="cover"
            quality={75}
            placeholder="blur"
          />
        </HeroWrap>

        <HeroText>
          <FluidContainer>
            <HeroHeading>Simple Form Processing</HeroHeading>
            <HeroMessage>
              Send your forms to us. We'll handle the rest.
            </HeroMessage>
            <HeroAction>
              <Link href="/signup" passHref legacyBehavior>
                <Button tabIndex="-1">Sign Up For Free</Button>
              </Link>
            </HeroAction>
          </FluidContainer>
        </HeroText>
      </Hero>

      <ActionBar>
        Want to see it in action? <Link href="/demo">Watch our demo.</Link>
      </ActionBar>

      <Features>
        <FluidContainer>
          <Heading>Give your forms flexibility</Heading>
          <Subheading>
            Add powerful features to your forms. No coding required.
          </Subheading>
          <FeaturesList>
            <li>E-mail form submissions to multiple people.</li>
            <li>
              View and manage every submission with our ad-free interface.
            </li>
            <li>Integrate form submissions with multiple services.</li>
            <li>Keep spam out of your life with our automatic filtering.</li>
          </FeaturesList>
        </FluidContainer>
      </Features>

      <CodeExampleContainer>
        <FluidContainer>
          <Heading>Take the plunge</Heading>
          <Subheading>Step 1: Replace your form's action attribute.</Subheading>
          <Code>
            {`<form `}
            <CodeHighlight>
              {`action="https://www.formdelegate.com/forms/00000000-1111-2222-3333-4444444444"`}
            </CodeHighlight>
            {` method="POST">`}
            <CodeTab>{`<input type="text" placeholder="Message">`}</CodeTab>
            <CodeTab>{`<button type="submit">Send</button>`}</CodeTab>
            {`</form>`}
          </Code>
          <SubheadingMarginless>Step 2: Relax.</SubheadingMarginless>
        </FluidContainer>
      </CodeExampleContainer>

      <Cards>
        <FluidContainer>
          <Card>
            <CardHeading>
              <CardIcon>
                <Image
                  src={iconFolder}
                  alt=""
                  height="24"
                  width="24"
                  aria-hidden={true}
                  role="presentation"
                />
              </CardIcon>
              <span>Your data.</span>
            </CardHeading>
            <p>Export or delete your data at any time.</p>
          </Card>
          <Card>
            <CardHeading>
              <CardIcon>
                <Image
                  src={iconBlocker}
                  alt=""
                  height="24"
                  width="24"
                  aria-hidden={true}
                  role="presentation"
                />
              </CardIcon>
              <span>No ads.</span>
            </CardHeading>
            <p>We'll never show you ads or abuse your privacy.</p>
          </Card>
          <Card>
            <CardHeading>
              <CardIcon>
                <Image
                  src={iconConnection}
                  alt=""
                  height="24"
                  width="24"
                  aria-hidden={true}
                  role="presentation"
                />
              </CardIcon>
              <span>Strong privacy.</span>
            </CardHeading>
            <p>
              Our guides help you ensure that your data is safe during transit.
            </p>
          </Card>
          <Card>
            <CardHeading>
              <CardIcon>
                <Image
                  src={iconLock}
                  alt=""
                  height="24"
                  width="24"
                  aria-hidden={true}
                  role="presentation"
                />
              </CardIcon>
              <span>Encryption.</span>
            </CardHeading>
            <p>
              Enroll in our client-side PGP beta and encrypt your form
              submissions.
            </p>
          </Card>
        </FluidContainer>
      </Cards>
    </React.Fragment>
  );
};

Index.getLayout = function getLayout(page) {
  return <FixedLayout>{page}</FixedLayout>;
};

export default Index;
