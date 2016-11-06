/* global NGD:true, $ */
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
    }
  }
  NGD.vis = new vis.Network(container, {}, options)

  // Load nodes
  $.ajax({
    url: 'data/nodes.json',
    success: (data) => {
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
        url: 'data/links.json',
        success: (data) => {
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
    $('#btnParse').click(() => {
      var input = $('#inputPhrase').val()
      var parser = new p.Parser(NGD.data)
      $('#output').html('')
      parser.parse(input, (err, data) => {
        if (err) {
          $('#output')
            .append($('<h3>').text('Error'))
            .append($('<pre>').addClass('alert-danger').text(err))
        } else {
          for (var i in data) {
            var out = typeof data[i] === 'string' ? data[i] : JSON.stringify(data[i], null, 2)
            $('#output')
              .append($('<h3>').text(i))
              .append($('<pre>').text(out))
          }

          visualise(data.network)
        }
      })
      return false
    })
  })

  /* global vis */
  function visualise (network) {
    var data = network.toVisJS()
    console.log(data)
    NGD.vis.setData(data)
  }
})
