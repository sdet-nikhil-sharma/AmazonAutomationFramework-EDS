Feature: Amazon Login with Page Object Model

  Scenario: User logs in successfully with mock credentials
    Given I navigate to amazon login
    When I enter mock credentials (email and password)
    Then I should be successfully logged in
