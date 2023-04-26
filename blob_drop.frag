#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_mouse_x;
uniform float u_mouse_y;
uniform float u_time;
uniform float u_scroll;

// ray marching
const float grad_step = 0.05;
const float clip_far = 10.0;

// math
#define QUARTER_PI 0.7853981634
#define HALF_PI 1.5707963268
#define PI 3.14159265359

float sdSphere( vec3 pos, float r ) {
	return length( pos ) - r;
}

float sdBox( vec3 p, vec3 b ) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdUnion( float d0, float d1 ) {
    return min( d0, d1 );
}

float sdInter( float d0, float d1 ) {
    return max( d0, d1 );
}

float sdUnion_s( float a, float b, float k ) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float droplet( vec3 p, float dist ) {
  // Decrease radius when droplet is inside sphere
  float radius = min(u_scroll - 0.4, 0.6);
  float box = sdBox(
      vec3(
          p.x + radius,
          p.y + radius,
          p.z + radius
      ),
      vec3(radius)
  );
  float sphere = sdSphere(
      vec3(
          p.x,
          p.y,
          p.z
      ),
      radius
  );
  float droplet = sdInter( box, sphere );
  return droplet;
}

vec2 rot( in vec2 p, in float an )
{
    float cc = cos(an);
    float ss = sin(an);
    return mat2(cc,-ss,ss,cc)*p;
}

float round(float x) {
    return sign(x) * floor(abs(x)+0.5);
}

float dist_field( vec3 p ) {
    vec3 pos = p;
    pos.xy = rot(pos.xy, -QUARTER_PI);
    pos.xz = rot(pos.xz, 0.0);
    pos.yz = rot(pos.yz, PI);

    float dr = droplet(pos, max(u_scroll -0.9, 0.0));
    float dist = max(u_scroll * 1.5 - 1.5, 0.0);
    float sphere = sdSphere( vec3(p.x, p.y + dist, p.z), 0.6 );

    return sdUnion_s(dr, sphere, 0.3);
}

// get gradient in the world
vec3 gradient( vec3 pos ) {
	const vec3 dx = vec3( grad_step, 0.0, 0.0 );
	const vec3 dy = vec3( 0.0, grad_step, 0.0 );
	const vec3 dz = vec3( 0.0, 0.0, grad_step );
	return normalize (
		vec3(
			dist_field( pos + dx ) - dist_field( pos - dx ),
			dist_field( pos + dy ) - dist_field( pos - dy ),
			dist_field( pos + dz ) - dist_field( pos - dz )			
		)
	);
}

vec3 fresnel( vec3 F0, vec3 h, vec3 l ) {
	return F0 + ( 1.0 - F0 ) * pow( clamp( 1.0 - dot( h, l ), 0.0, 1.0 ), 5.0 );
}

// phong shading
vec3 shading( vec3 v, vec3 n, vec3 dir, vec3 eye ) {
	float shininess = 16.0;
	vec3 final = vec3( 0.0 );
	vec3 ref = reflect( dir, n );
  vec3 Ks = vec3( 0.5 );
  vec3 Kd = vec3( 1.0 );

	// light 0
	{
		vec3 light_pos   = vec3( 20.0, 20.0, 20.0 );
		vec3 light_color = vec3( 1.0, 0.8, 0.9 );
		vec3 vl = normalize( light_pos - v );
		vec3 diffuse  = Kd * vec3( max( 0.0, dot( vl, n ) ) );
		vec3 specular = vec3( max( 0.0, dot( vl, ref ) ) );
    vec3 F = fresnel( Ks, normalize( vl - dir ), vl );
		specular = pow( specular, vec3( shininess ) );

		final += light_color * mix( diffuse, specular, F ); 
	}
	
	// light 1
	{
		vec3 light_pos   = vec3( -20.0, -20.0, -30.0 );
		vec3 light_color = vec3( 0.3, 0.3, 0.3 );
		vec3 vl = normalize( light_pos - v );
		vec3 diffuse  = Kd * vec3( max( 0.0, dot( vl, n ) ) );
		vec3 specular = vec3( max( 0.0, dot( vl, ref ) ) );
    vec3 F = fresnel( Ks, normalize( vl - dir ), vl );
		specular = pow( specular, vec3( shininess ) );

		final += light_color * mix( diffuse, specular, F );
	}

  vec3 mix_colors = mix(
    vec3(0.0, 0.776, 0.756),
    vec3(1.0, 0.4824, 0.67),
    smoothstep(
      1.2,
      0.7,
      length( v.xy + vec2(0.0, -QUARTER_PI))
    )
  );

  final += mix_colors * fresnel( Ks, n, -dir );

	return final;
}


bool ray_vs_aabb(vec3 o, vec3 dir, vec3 bmin, vec3 bmax, inout vec2 e ) {
    vec3 a = ( bmin - o ) / dir;
    vec3 b = ( bmax - o ) / dir;
    
    vec3 s = min( a, b );
    vec3 t = max( a, b );
    
    e.x = max( max( s.x, s.y ), max( s.z, e.x ) );
    e.y = max( min( t.x, t.y ), max( t.z, e.y ) );
    
    return e.x < e.y;
}

// ray marching
bool ray_marching( vec3 o, vec3 dir, inout float depth, inout vec3 n ) {
	float t = 0.0;
    float d = 10000.0;
    float dt = 0.0;

    for ( int i = 0; i < 128; i++ ) {
        vec3 v = o + dir * t;
        d = dist_field( v );
        if ( d < 0.001 ) {
            break;
        }
        dt = min( abs(d), 0.1 );
        t += dt;
        if ( t > depth ) {
            break;
        }
    }

    if ( d >= 0.001 ) {
      return false;
    }

    depth = t;
    n = normalize( gradient( o + dir * t ) );
    return true;
}

// get ray direction
vec3 ray_dir( float fov, vec2 size, vec2 pos ) {
	vec2 xy = pos - size * 0.5;
	float cot_half_fov = tan( ( PI - fov ));
	float z = size.y * 0.5 * cot_half_fov;

	return normalize( vec3( xy, -z ) );
}

// camera rotation : pitch, yaw
mat3 rotationXY( vec2 angle ) {
	vec2 c = cos( angle );
	vec2 s = sin( angle );
	
	return mat3(
		c.y      ,  0.0, -s.y,
		s.y * s.x,  c.x,  c.y * s.x,
		s.y * c.x, -s.x,  c.y * c.x
	);
}

void main() {
	// default ray dir
	vec3 dir = ray_dir( 5.3, u_resolution.xy, gl_FragCoord.xy );

	// default ray origin
	vec3 eye = vec3( 0.0, 0.0, 3.0 );

	// rotate camera
	mat3 rot = rotationXY( ( (vec2(u_mouse_x, u_mouse_y) / u_resolution.xy) + vec2(-0.25, -0.25) ).yx);
	dir = rot * dir;
	eye = rot * eye;

	// ray marching
    float depth = clip_far;
    vec3 n = vec3( 0.0 );
	if ( !ray_marching( eye, dir, depth, n ) ) {
    gl_FragColor = vec4(0.0,0.0,0.0,0.0);
    return;
	}

	// shading
	vec3 pos = eye + dir * depth;
  vec3 color = shading( pos, n, dir, eye );

	gl_FragColor = vec4( color, 1.0 );
}
