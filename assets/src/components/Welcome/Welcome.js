import React from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { Link } from 'react-router-dom';
import Button from 'components/Button';
import FluidContainer from 'components/FluidContainer';
import heroImage from 'images/hero.jpg';
import theme from 'constants/theme';

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
  flex: 1 1 auto;
  width: 200px;
`;

const CardHeading = styled.h2`
  font-size: 1.45rem;
  margin: 0;
`;

const Cards = styled.div`
  background-color: ${theme.offWhite};
  padding: 1rem 0;

  /* FluidContainer */
  & > div {
    display: flex;
    flex-direction: row;
  }

  /* Card */
  & > div > div:not(:last-child) {
    margin-right: 1.5rem;
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
  display: inline-block;
  font-size: 0.8rem;
  margin-bottom: 1rem;
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
  display: flex;
  flex-direction: column;
  min-height: 400px;
  background-image: url(${heroImage});
  background-size: cover;
`;

const HeroAction = styled.div`
  margin-top: 1rem;
`;

const HeroHeading = styled.h1`
  font-size: 2.4rem;
  margin-top: 2.3rem;
`;

const HeroMessage = styled.div`
  color: $mine-black;
  margin-top: 0.5rem;
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

const SubheadingMarginless = Subheading.extend`
  margin: 0;
`;

const Welcome = () => (
  <div>
    <Hero>
      <FluidContainer>
        <HeroHeading>Simple Form Processing</HeroHeading>
        <HeroMessage>Send your forms to us. We'll handle the rest.</HeroMessage>
        <HeroAction>
          <Link to="/register">
            <Button tabIndex="-1">Try It For Free</Button>
          </Link>
        </HeroAction>
      </FluidContainer>
    </Hero>

    <ActionBar>
      Want to see it in action? <a href="#">Watch our demo.</a>
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
          <CardHeading>You own your data.</CardHeading>
          <p>Export or permanently delete your data at any time.</p>
        </Card>
        <Card>
          <CardHeading>No ads.</CardHeading>
          <p>
            Your data isn't used for our monetization. We'll never sell your
            information.
          </p>
        </Card>
        <Card>
          <CardHeading>Strong privacy.</CardHeading>
          <p>
            Our guides help you ensure that your data is safe during transit.
          </p>
        </Card>
        <Card>
          <CardHeading>Encryption.</CardHeading>
          <p>
            Enroll in our client-side PGP beta and encrypt your form
            submissions.
          </p>
        </Card>
      </FluidContainer>
    </Cards>
  </div>
);

export default Welcome;
