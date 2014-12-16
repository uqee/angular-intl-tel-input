/* global intlTelInputUtils, LPN */
(function (intlTelInputUtils, libphonenumberURL) {
  'use strict';
  
  angular
    .module('ngIntlTelInput', [])

    .factory('intlTelInputUtils', [
      function () {
        return intlTelInputUtils;
      }
    ])

    .directive('intlTelInput', [
      function () {
        return {
          restrict: 'A',
          require: '^ngModel',
          scope: {

            // boolean
            autoFormat:         '=itiAutoFormat',
            autoHideDialCode:   '=itiAutoHideDialCode',
            nationalMode:       '=itiNationalMode',
            responsiveDropdown: '=itiResponsiveDropdown',
            includePlus:        '=itiIncludePlus',

            // strings
            defaultCountry: '@itiDefaultCountry',
            numberType:     '@itiNumberType',
            utilsScript:    '@itiUtilsScript',

            // arrays
            onlyCountries:      '=itiOnlyCountries',
            preferredCountries: '=itiPreferredCountries'
          },
          link: function ($scope, element, attrs, ngModel) {
            var number = element.val(), country;

            // bind intlTelInput functionality
            // $scope is used instead of options as their superset
            $(element).intlTelInput($scope);

            // load libphonenumber.js
            $(element).intlTelInput('loadUtils', $scope.utilsScript || libphonenumberURL);

            // if not national mode
            // just add plus to initial value
            // without it intlTelInput gets confused
            if (!$scope.nationalMode) {
              if (number[0] !== '+') element.val('+' + number);
            }

            // in national mode
            // you have to remove the country code from your full number
            else {
              country = $(element).intlTelInput('getSelectedCountryData');
              if (country)
                $(element).intlTelInput('setNumber', number.substring(country.dialCode.length));
            }

            // add custom validator to the ngModel controller
            ngModel.$validators.tel = function (modelValue, viewValue) {
              return $(element).intlTelInput('isValidNumber');
            };

            // add custom parser to the ngModel controller
            ngModel.$parsers.push(function (value) {

              // returns international number, e.g. '+12223334455'
              var number = $(element).intlTelInput('getCleanNumber');
              if ($scope.includePlus) return number;

              // remove plus (get substring from the second char to the end)
              else return number.substring(1);
            });

            // change view value
            // this listener doesn't need to be removed when element.on('$destroy', ...) fires because it is binded to the element itself
            element.on('blur keyup change', function (event) {
              ngModel.$setViewValue(element.val());
              $scope.$apply();
            });
          }
        };
      }
    ]);
})(intlTelInputUtils, LPN);
