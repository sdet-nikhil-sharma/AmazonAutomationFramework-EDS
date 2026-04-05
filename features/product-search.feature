Feature: Find Lowest and Highest Price Products

  Background:
    Given I navigate to amazon
    When I search for "Mobile" in the search box
    Then I should see search results with multiple products

  Scenario: Find and display lowest price product
    When I find the lowest price product
    Then I click on the lowest price product
    And I read and print "About this item" details in new tab

  Scenario: Find and display highest price product
    When I find the highest price product
    Then I click on the highest price product
    And I read and print "About this item" details in new tab
