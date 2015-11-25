angular.module('open-autocomplete', [])

    .factory('openAutocompleteSettings', ['$http', function ($http) {
        return function (settings) {
            if (!settings.dataSource) {
                return settings.onError('You must defined a data source');
            } else if (!angular.isFunction(settings.dataSource)) {
                var url = settings.dataSource;
                settings.dataSource = function (val, limit) {
                    $http.get(url, {
                        params: {
                            input: val,
                            limit: this.limit
                        }
                    }).then(this.parseResult, this.onError).finally(this.showAutocomplete);
                }
            }
            return settings;
        };
    }])

    .directive('openAutocomplete', ['openAutocompleteSettings', '$compile', function (openAutocompleteSettings, $compile) {
        return {
            scope: {
                oaOptions: '='
            },
            link: function (scope, element, attrs) {
                scope.list = angular.element('<ul class="open-autocomplete"></ul>');
                scope.results = [];
                scope.visible = false;
                scope.settings = openAutocompleteSettings(angular.extend({
                    limit: false,
                    addLabel: 'Add',
                    onSelect: function ($event) {
                        var item = angular.element($event.target);

                        if (item.hasClass('add')) {
                            if (scope.settings.onAdd) {
                                scope.settings.onAdd(item.html());
                            }
                        } else {
                            element.val(item.html());
                            if (scope.settings.onExist) {
                                scope.settings.onExist(item.html());
                            }
                        }

                        scope.settings.hideAutocomplete();
                    },
                    parseResult: function (res) {
                        scope.results = res.data.match;
                    },
                    showAutocomplete: function () {
                        if (element.val() || scope.results.length > 0) {
                            //Clear previous content
                            var exactMatch = false;

                            scope.list.empty();

                            angular.forEach(scope.results, function (item, idx) {
                                scope.list.append('<li ng-click="settings.onSelect($event)">' + item + '</li>');

                                if (item == element.val()) {
                                    exactMatch = true;
                                }
                            });

                            if (!exactMatch && element.val()) {
                                scope.list.append('<li ng-click="settings.onSelect($event)" class="add">' + scope.settings.addLabel + ' ' + element.val() + '</li>');
                            }

                            angular.element(document.body).append($compile(scope.list)(scope));
                            scope.visible = true;

                            scope.settings.positionPopup();
                        } else {
                            scope.settings.hideAutocomplete();
                        }
                    },
                    hideAutocomplete: function () {
                        scope.list.detach();
                        scope.visible = false;
                    },
                    onError: function (msg) {
                        return false;
                    },
                    positionPopup: function () {
                        var de = document.documentElement;
                        var box = element[0].getBoundingClientRect();
                        var top = box.top + window.pageYOffset - de.clientTop;
                        var left = box.left + window.pageXOffset - de.clientLeft;
                        var offset = { top: top, left: left };

                        scope.list.css({
                            top: offset.top + element[0].offsetHeight + 'px',
                            left: offset.left + 'px',
                            width: element[0].offsetWidth - (scope.list[0].offsetWidth - scope.list[0].clientWidth) + 'px'
                        });
                    }
                }, scope.oaOptions));

                element.on('input focus', function () {
                    if (scope.settings.onEditing) {
                        scope.settings.onEditing();
                    }
                    scope.results = []; //Reset results before send
                    scope.settings.dataSource(element.val());
                });

                angular.element(document).on('click', function (event) {
                    if (scope.visible && event.target != element[0]) {
                        scope.settings.hideAutocomplete();
                        if (scope.settings.onCancelInput) {
                            scope.$apply(scope.settings.onCancelInput);
                        }
                    }
                });
            }
        };
    }]);