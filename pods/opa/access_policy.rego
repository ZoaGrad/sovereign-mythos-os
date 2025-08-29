# OPA Policy for POD Access Control
package mythos_pods

default allow = false

allow {
    input.principal == "alice:did:key:z6Mkf...7V"
    input.resource == "data:ipfs://bafydata"
    input.vc_verified == true  # Requires VC consent
}
