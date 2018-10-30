import React from 'react';
import styled from 'styled-components/macro';
import { lighten, darken } from 'polished';
import { Link } from 'react-router-dom';

import heroImage from 'images/hero-person-at-computer.jpg';
import iconBlocker from 'images/icon-blocker.svg';
import iconConnection from 'images/icon-connection.svg';
import iconFolder from 'images/icon-folder.svg';
import iconLock from 'images/icon-lock.svg';
import theme from 'constants/theme';
import { media } from 'utils/style';

import Button from 'components/Button';
import FluidContainer from 'components/FluidContainer';

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
  background-image: url(${props => props.icon});
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  height: 24px;
  margin: ${props => (props.margin ? props.margin : '0 0.5rem 0 0')};
  overflow: hidden;
  width: 24px;
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
  background-image: url(${heroImage});
  background-position: right;
  background-size: cover;
  box-shadow: inset 0 0 0 1000px rgba(50, 43, 40, 0.55);
  display: flex;
  flex-direction: column;
  min-height: 275px;

  ${media.md`
    min-height: 400px;
  `};
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

const Welcome = () => (
  <React.Fragment>
    <Hero>
      <FluidContainer>
        <HeroHeading>Simple Form Processing</HeroHeading>
        <HeroMessage>Send your forms to us. We'll handle the rest.</HeroMessage>
        <HeroAction>
          <Link to="/register">
            <Button tabIndex="-1">Sign Up For Free</Button>
          </Link>
        </HeroAction>
      </FluidContainer>
    </Hero>

    <ActionBar>
      Want to see it in action? <Link to="/demo">Watch our demo.</Link>
    </ActionBar>

    <Features>
      <FluidContainer>
        <Heading>Give your forms flexibility</Heading>
        <Subheading>
          Add powerful features to your forms. No coding required.
        </Subheading>
        <FeaturesList>
          <li>Send form submissions to multiple e-mail users.</li>
          <li>View and manage every submission with our ad-free interface.</li>
          <li>Create endless integrations with Zappier.</li>
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
            {`action="https://www.formdelegate.com/f/########"`}
          </CodeHighlight>
          {` method="POST">`}
          <CodeTab>{`<input type="text" placeholder="Message">`}</CodeTab>
          <CodeTab>{`<button type="Submit">Send</button>`}</CodeTab>
          {`</form>`}
        </Code>
        <SubheadingMarginless>Step 2: Relax.</SubheadingMarginless>
      </FluidContainer>
    </CodeExampleContainer>

    <Cards>
      <FluidContainer>
        <Card>
          <CardHeading>
            <CardIcon aria-hidden="true" icon={iconFolder} />
            <span>Your data.</span>
          </CardHeading>
          <p>Export or delete your data at any time.</p>
        </Card>
        <Card>
          <CardHeading>
            <CardIcon aria-hidden="true" icon={iconBlocker} />
            <span>No ads.</span>
          </CardHeading>
          <p>
            Your data isn't used for our monetization. We'll never sell your
            information.
          </p>
        </Card>
        <Card>
          <CardHeading>
            <CardIcon aria-hidden="true" icon={iconConnection} />
            <span>Strong privacy.</span>
          </CardHeading>
          <p>
            Our guides help you ensure that your data is safe during transit.
          </p>
        </Card>
        <Card>
          <CardHeading>
            <CardIcon aria-hidden="true" icon={iconLock} margin="0" />
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

export default Welcome;
