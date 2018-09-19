/// <reference path="discover.controller.ts"/>
/// <reference path="../labels/labels.module.ts"/>

namespace Online {

  export const discoverModule = angular
    .module('hawtio-online-discover', [
      'angularMoment',
      'KubernetesAPI',
      'patternfly',
      labelsModule.name,
      'hawtio-online-status',
    ])
    .controller('DiscoverController', DiscoverController)
    .directive('podListRow', podListRowDirective)
    .directive('listRowExpand', expansionDirective)
    .directive('podCard', podCardDirective)
    .directive('matchHeight', matchHeightDirective)
    .directive('httpSrc', httpSrcDirective)
    .filter('jolokiaContainers', jolokiaContainersFilter)
    .filter('jolokiaPort', jolokiaPortFilter)
    .filter('connectUrl', connectUrlFilter)
    .filter('podDetailsUrl', podDetailsUrlFilter);


  function podListRowDirective($window: ng.IWindowService, openShiftConsole: ConsoleService) {
    'ngInject';
    return {
      restrict    : 'EA',
      templateUrl : 'src/discover/podListRow.html',
      scope       : {
        pod : '=',
      },
      link: function ($scope: ng.IScope | any) {
        openShiftConsole.url.then(url => $scope.openshiftConsoleUrl = url);
        $scope.getStatusClasses = (pod, status) => getPodClasses(pod, { status, viewType: 'listView' });
        $scope.open = (url) => {
          $window.open(url);
          return true;
        };
      },
    };
  }

  function podCardDirective($window: ng.IWindowService, openShiftConsole: ConsoleService) {
    'ngInject';
    return {
      restrict    : 'EA',
      templateUrl : 'src/discover/podCard.html',
      scope       : {
        pod : '=',
      },
      link: function ($scope: ng.IScope | any) {
        openShiftConsole.url.then(url => $scope.openshiftConsoleUrl = url);
        $scope.getStatusClasses = (pod, status) => getPodClasses(pod, { status, viewType: 'cardView' });
        $scope.open = (url) => {
          $window.open(url);
          return true;
        };
      },
    };
  }

  function expansionDirective() {
    return new ListRowExpandDirective();
  }

  function matchHeightDirective($timeout: ng.ITimeoutService) {
    'ngInject';
    return new MatchHeightDirective($timeout);
  }

  function httpSrcDirective($http: ng.IHttpService) {
    'ngInject';
    return new HttpSrcDirective($http);
  }

  function jolokiaContainersFilter() {
    return containers => (containers || []).filter(container => container.ports.some(port => port.name === 'jolokia'));
  }

  function jolokiaPortFilter() {
    return container => container.ports.find(port => port.name === 'jolokia');
  }

  function connectUrlFilter() {
    return (pod, port = 8778) => new URI().path('/integration/')
      .query({
        jolokiaUrl : new URI().query('').path(`/master/api/v1/namespaces/${pod.metadata.namespace}/pods/https:${pod.metadata.name}:${port}/proxy/jolokia/`),
        title      : pod.metadata.name,
        returnTo   : new URI().toString(),
      });
  }

  function podDetailsUrlFilter() {
    return (pod, openShiftConsoleUrl: string) => UrlHelpers.join(openShiftConsoleUrl, 'project', pod.metadata.namespace, 'browse/pods', pod.metadata.name);
  }

  hawtioPluginLoader.addModule(discoverModule.name);
}
