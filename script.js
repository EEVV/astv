const svg = SVG("svg");
const svg_g = svg.group();
const textarea = document.getElementById("textarea");

// todo fix this
// make it move to center
svg_g.move(300, 50);

var m_x = null;
var m_y = null;
var m = false;

var s_x = null;
var s_y = null;

function move_g(new_x, new_y) {
    svg_g.move(new_x, new_y);
}

svg.mousedown(function(event) {
    m_x = event.offsetX;
    m_y = event.offsetY;
    m = true;

    s_x = svg_g.x();
    s_y = svg_g.y();
})

svg.mouseup(function() {
    m = false;
})

svg.mousemove(function(event) {
    if (!m) {
        return;
    }

    let x = event.offsetX;
    let y = event.offsetY;

    move_g(s_x - m_x + x, s_y - m_y + y);
})

svg.on("wheel", function(event) {
    // todo zoom-in feature
})

// begin parsing
function getIden(source) {
    let acc = "";

    while ((source != "") && (source.charAt(0) != ')') && (source.charAt(0) != ' ')) {
        acc = acc + source.charAt(0);
        source = source.substr(1);
    }

    return [[acc], source]
}

function skipSpaces(source) {
    while (source.charAt(0) == ' ') {
        source = source.substr(1);
    }

    return source;
}

function getNode(source) {
    if (source.charAt(0) == '(') {
        source = source.substr(1);
        let m = getNode(source);
        source = m[1];
        if (source.charAt(0) != ')') {
            return null;
        }
        source = source.substr(1);
        return [m[0], source]
    } else {
        let m = getIden(source);
        source = m[1];
        let nodes = m[0];
        source = skipSpaces(source);
        while ((source != "") && (source.charAt(0) != ')')) {
            let m = null
            if (source.charAt(0) == '(') {
                m = getNode(source);
            } else {
                m = getIden(source);
            }
            if (m == null) {
                return null;
            }
            source = m[1];
            nodes.push(m[0]);
            source = skipSpaces(source);
        }

        return [nodes, source];
    }
}
// end parsing

// returns the element
function svgNode(svg, node) {
    let name = node[0];
    let nodes = node.slice(1);
    let group = svg.group();
    let nodes_set = group.set();
    let x_curr = 0;
    for (let i = 0; i < nodes.length; i++) {
        let child = svgNode(group, nodes[i]);
        nodes_set.add(child);
        let child_w = child.bbox().w;
        child.move(x_curr + child_w / 2, 0);
        x_curr += child.bbox().w;
        // spacing
        x_curr += 25;
    }
    let nodes_bbox = group.bbox();
    let name_svg = group.text(name).center(0, 0);
    let name_bbox = name_svg.bbox();
    let offset = 2*name_bbox.x + name_bbox.w - 2*nodes_bbox.x - nodes_bbox.w;
    offset /= 2;
    nodes_set.each(function(i, children) {
        this.move(this.x() + offset, this.y() + Math.log2(nodes.length) * 25 + 25);
        let this_bbox = this.bbox();
        group.line(0, 0, this.x(), this.y()).stroke({width: 1}).back();
    });
    group.rect(name_bbox.w + 5, name_bbox.h).center(0, 0).attr({fill: "#fff"});
    name_svg.front();
    return group;
}

textarea.oninput = function() {
    text = textarea.value;
    let m = getNode(text);
    if (m == null) {
        return;
    }
    svg_g.clear();
    svgNode(svg_g, m[0]);
}