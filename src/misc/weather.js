module.exports = function () {
  var needle = require('needle');
  var getURL = function (location) {
    return 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + location + '%22)%20and%20u=%27c%27&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
  };

  this.get = function (msgPayload) {
    try {
      query(msgPayload.parameter, msgPayload.raw);
    } catch (e) {
      returnMessage(msgPayload.raw, 'Could not parse city');
    }
  };

  function query(location, rawEvent) {
    needle.get(getURL(location), function (err, res) {
      if (err) {
        returnMessage(rawEvent, 'Error ' + err);
        return;
      }

      if (!res.body.query || res.body.query.results === null) {
        returnMessage(rawEvent, 'Invalid request.');
        return;
      }
      var obj = res.body.query.results.channel;
      var title = '\n' + obj.title;
      var wind = '\n' + (obj.wind.speed / 3.6) + 'm/s | ' + obj.wind.direction + '°';
      obj = res.body.query.results.channel.item;
      var weather = '\n' + obj.condition.date + ' \n\n ' + obj.condition.temp + '°C  ' + obj.condition.text + '\n\n';
      var forecastTitle = '\n\nFORECAST:\n';
      var forecast = '';
      for(var i = 0; i < obj.forecast.length; i++) {
        var condition = obj.forecast[i];
        forecast += '\n' + condition.day + ', ' + condition.date + '    ' + condition.low + ' - ' + condition.high + '°C   ' + condition.text; 
      }
      
      returnMessage(rawEvent, title+weather+wind+forecastTitle+forecast);

    });
  }

  function returnMessage(rawEvent, content) {
    App.botClient.sendMessage(rawEvent, content);
  }
};