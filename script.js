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
      var tbody = $('#data-nodes table tbody')
      for (var i in data) {
        var item = data[i]
        $('<tr>')
          .append($('<td>').text(item.type))
          .append($('<td>').text(item.key))
          .append($('<td>').text(item.label))
          .appendTo(tbody)
      }
    }
  })

  // Load links
  $.ajax({
    url: 'data/links.json',
    success: (data) => {
      NGD.data.links = data
      var tbody = $('#data-links table tbody')
      for (var i in data) {
        var item = data[i]
        $('<tr>')
          .append($('<td>').text(item.type))
          .append($('<td>').text(item.quo.key + (item.quo.parent ? ' (P)' : '')))
          .append($('<td>').text(item.rel.key ? item.rel.key : 'null'))
          .append($('<td>').text(item.sic.key + (item.sic.parent ? ' (P)' : '')))
          .append($('<td>').text(item.status))
          .appendTo(tbody)
      }
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
