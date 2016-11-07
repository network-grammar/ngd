/* global NGD:true, $, vis */
NGD = {
  data: {
    nodes: [],
    links: []
  },
  vis: null // visualisation object
}

$(function () {
  // Init vis canvas
  var container = document.getElementById('canvas')
  var options = {
    edges: {
      smooth: {
        type: 'discrete',
        roundness: 0
      },
      width: 2
    },
    nodes: {
      mass: 5,
      shape: 'dot',
      size: 20
    },
    interaction: {
      zoomView: false
    }
  }
  NGD.vis = new vis.Network(container, {}, options)

  const data_path = '../data/'

  // Load nodes
  $.ajax({
    url: data_path + 'nodes.json',
    success: function (data) {
      NGD.data.nodes = data
      var nodes_dict = {}
      var tbody = $('#data-nodes table tbody')
      for (var i in data) {
        var item = data[i]
        nodes_dict[item.key] = item.label
        $('<tr>')
          .attr('id', 'node-' + item.key)
          .append($('<td>').text(item.type))
          .append($('<td>').text(item.key))
          .append($('<td>').text(item.label))
          .appendTo(tbody)
      }

      // Load links
      $.ajax({
        url: data_path + 'links.json',
        success: function (data) {
          NGD.data.links = data
          var tbody = $('#data-links table tbody')
          for (var i in data) {
            var item = data[i]

            var text = {}
            var fields = ['quo', 'rel', 'sic']
            for (var f in fields) {
              var field = fields[f]
              if (!item[field].key) {
                text[field] = '<em>null</em>'
                continue
              }
              text[field] = item[field].key
              if (item[field].parent) text[field] += ' (P)'
              text[field] += ' <span class="text-muted">' + nodes_dict[item[field].key] + '</span>'
            }

            $('<tr>')
              .append($('<td>').html(item.type))
              .append($('<td>').html(text.quo))
              .append($('<td>').html(text.rel))
              .append($('<td>').html(text.sic))
              .append($('<td>').html(item.status))
              .appendTo(tbody)
          }
        }
      })
    }
  })

  require(['Parser'], function (p) {
    $('#btnParse').click(function () {
      var input = $('#inputPhrase').val()
      var parser = new p.Parser(NGD.data)
      $('#output').html('')
      NGD.vis.setData({})
      $('#chart tbody').html('')
      parser.parse(input, function (err, data) {
        if (err) {
          $('#output')
            .append($('<h3>').text('Error'))
            .append($('<pre>').addClass('alert-danger').text(err))
        } else {
          // Dump parser output
          var fields = ['output', 'provisionals', 'log']
          for (var i in fields) {
            var field = fields[i]
            var out = typeof data[field] === 'string' ? data[field] : JSON.stringify(data[field], null, 2)
            $('#output')
              .append($('<h3>').text(field))
              .append($('<pre>').text(out))
          }

          // Visualise network
          var vis_data = data.network.toVisJS()
          console.log(vis_data)
          NGD.vis.setData(vis_data)

          // Fill parse chart
          $('#chart tbody').html('<tr><td colspan="13">TODO...</td></tr>')
        }
      })
      return false
    })
  })
})
