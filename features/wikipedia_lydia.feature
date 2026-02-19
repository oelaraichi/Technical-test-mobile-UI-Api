Feature: Wikipedia app - Lydia flow

 Scenario: Swipe carousel, search Lydia and open Cresus in French
  Given I launch the app
  And I complete onboarding
  When I search for "Lydia"
  And I scroll results until I find the city "Lydia"
  And I dismiss the popup if it appears
  And I change the language to French
  And I scroll to the bottom of the page
  And I open "Cresus" from the page
  Then the "Cresus" page should be displayed
